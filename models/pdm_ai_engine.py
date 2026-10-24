"""
Predictive Maintenance (PdM) AI Engine:
Calculates Health Index (HI), Remaining Useful Life (RUL) with confidence intervals,
sensor anomaly attribution, and condition-adjusted failure probability using Weibull hazard modeling.
"""

import math
from typing import Dict, List, Any, Tuple


class PdMAIEngine:
    """
    AI Degradation and Prognostics Engine for Industrial Equipment.
    Combines multi-sensor anomaly scoring with Weibull reliability physics.
    """

    @staticmethod
    def calculate_health_index(
        asset_profile: Dict[str, Any],
        telemetry: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Computes composite Health Index (HI) from real-time telemetry inputs.
        Returns HI (0-100%), degradation state, and feature attribution contributions.
        """
        sensors = asset_profile["sensors"]
        total_penalty = 0.0
        feature_attributions: Dict[str, Dict[str, Any]] = {}

        for key, spec in sensors.items():
            val = telemetry.get(key, spec["baseline"])
            baseline = spec["baseline"]
            warning = spec["warning"]
            critical = spec["critical"]
            weight = spec["weight"]

            # Normalized stress score [0.0 to 1.0+]
            if val <= baseline:
                ratio = 0.0
            elif val <= warning:
                # Mild degradation zone: 0.0 to 0.4
                ratio = 0.4 * ((val - baseline) / max(1e-6, warning - baseline))
            elif val <= critical:
                # Accelerated degradation zone: 0.4 to 1.0
                ratio = 0.4 + 0.6 * ((val - warning) / max(1e-6, critical - warning))
            else:
                # Super-critical runaway wear: > 1.0
                ratio = 1.0 + 0.5 * ((val - critical) / max(1e-6, critical - warning))

            # Non-linear damage accumulation penalty
            penalty = weight * (ratio ** 1.85)
            total_penalty += penalty

            feature_attributions[key] = {
                "name": spec["name"],
                "unit": spec["unit"],
                "current_value": round(val, 2),
                "baseline": baseline,
                "warning": warning,
                "critical": critical,
                "weight": weight,
                "stress_ratio": round(ratio, 3),
                "contribution_pct": 0.0,  # Updated below
                "category": spec.get("category", "Operational")
            }

        # Health Index calculation (bounded 0 to 100)
        # Using exponential decay based on aggregated stress penalty
        hi = 100.0 * math.exp(-1.45 * total_penalty)
        hi = max(1.0, min(100.0, hi))

        # Calculate percentage contribution of each sensor to the degradation
        if total_penalty > 0:
            for key, attr in feature_attributions.items():
                stress = attr["stress_ratio"]
                w = attr["weight"]
                comp_pen = w * (stress ** 1.85)
                attr["contribution_pct"] = round((comp_pen / total_penalty) * 100.0, 1)
        else:
            eq_share = round(100.0 / max(1, len(feature_attributions)), 1)
            for attr in feature_attributions.values():
                attr["contribution_pct"] = eq_share

        # Determine degradation status
        if hi >= 85.0:
            status = "HEALTHY"
            status_color = "#10b981"  # Emerald
            severity_desc = "Optimal operating state with negligible wear accumulation."
        elif hi >= 70.0:
            status = "NORMAL_WEAR"
            status_color = "#06b6d4"  # Cyan
            severity_desc = "Standard progressive wear within design engineering tolerances."
        elif hi >= 50.0:
            status = "INCIPIENT_FAULT"
            status_color = "#f59e0b"  # Amber
            severity_desc = "Detectable sub-surface degradation; thermal/vibrational anomalies detected."
        elif hi >= 30.0:
            status = "SEVERE_DEGRADATION"
            status_color = "#f97316"  # Orange
            severity_desc = "Accelerated mechanical/thermal wear; high risk of cascading component failure."
        else:
            status = "CRITICAL_IMMINENT_FAILURE"
            status_color = "#ef4444"  # Ruby Red
            severity_desc = "Extreme failure probability; immediate economic and physical hazard."

        return {
            "health_index": round(hi, 1),
            "status": status,
            "status_color": status_color,
            "severity_desc": severity_desc,
            "total_penalty": round(total_penalty, 3),
            "feature_attributions": feature_attributions
        }

    @staticmethod
    def forecast_rul(
        current_age_years: float,
        expected_life_years: float,
        current_hi: float,
        degradation_rate_multiplier: float = 1.0
    ) -> Dict[str, Any]:
        """
        Estimates Remaining Useful Life (RUL) in months and years.
        Provides P10, P50 (expected), and P90 confidence intervals.
        Critical failure threshold is HI = 20.0.
        """
        failure_hi_threshold = 20.0

        if current_hi <= failure_hi_threshold:
            return {
                "rul_months_p50": 0.5,
                "rul_months_p10": 0.1,
                "rul_months_p90": 1.2,
                "rul_years_p50": round(0.5 / 12.0, 2),
                "failure_year_p50": round(current_age_years + (0.5 / 12.0), 2),
                "confidence_interval_months": [0.1, 1.2],
                "forecast_trajectory": [{"month": 0, "hi": current_hi}]
            }

        # Base degradation decay constant lambda
        # Derived from expected life: 100 * exp(-lambda * T_life) = 20
        # lambda_base = -ln(0.20) / T_life = 1.6094 / T_life
        base_lambda = 1.6094 / max(1.0, expected_life_years)

        # Dynamic degradation rate adjusted by current health acceleration
        # If asset has degraded faster than age implies, acceleration is > 1.0
        expected_hi_at_age = 100.0 * math.exp(-base_lambda * current_age_years)
        wear_acceleration = max(0.6, (100.0 - current_hi) / max(5.0, 100.0 - expected_hi_at_age))
        
        effective_lambda = base_lambda * wear_acceleration * degradation_rate_multiplier

        # Expected RUL (P50) in years: solve current_hi * exp(-effective_lambda * RUL) = failure_hi_threshold
        # RUL_years = ln(current_hi / failure_hi_threshold) / effective_lambda
        rul_years_p50 = math.log(current_hi / failure_hi_threshold) / max(0.01, effective_lambda)
        rul_months_p50 = max(0.2, rul_years_p50 * 12.0)

        # Confidence intervals (uncertainty widens with longer horizons)
        volatility = 0.22 * math.sqrt(max(0.5, rul_years_p50))
        rul_months_p10 = max(0.1, rul_months_p50 * math.exp(-1.28 * volatility))
        rul_months_p90 = rul_months_p50 * math.exp(1.28 * volatility)

        # 24-month forward projection trajectory for visualization
        trajectory = []
        for m in range(0, min(48, int(math.ceil(rul_months_p90)) + 6), 2):
            t_yr = m / 12.0
            hi_proj = current_hi * math.exp(-effective_lambda * t_yr)
            trajectory.append({
                "month_offset": m,
                "projected_age_years": round(current_age_years + t_yr, 2),
                "hi_p50": round(max(5.0, min(100.0, hi_proj)), 1),
                "hi_p10": round(max(5.0, min(100.0, hi_proj * math.exp(-0.2 * math.sqrt(t_yr + 0.1)))), 1),
                "hi_p90": round(max(5.0, min(100.0, hi_proj * math.exp(0.2 * math.sqrt(t_yr + 0.1)))), 1),
            })

        return {
            "rul_months_p50": round(rul_months_p50, 1),
            "rul_months_p10": round(rul_months_p10, 1),
            "rul_months_p90": round(rul_months_p90, 1),
            "rul_years_p50": round(rul_years_p50, 2),
            "failure_year_p50": round(current_age_years + rul_years_p50, 2),
            "confidence_interval_months": [round(rul_months_p10, 1), round(rul_months_p90, 1)],
            "forecast_trajectory": trajectory
        }

    @staticmethod
    def calculate_condition_failure_probability(
        age_years: float,
        health_index: float,
        beta: float = 2.8,
        nominal_eta_years: float = 10.0
    ) -> float:
        """
        Weibull cumulative failure probability adjusted for real-time Health Index.
        beta > 1 represents the wear-out regime.
        As HI drops, characteristic life eta shrinks rapidly.
        """
        # Dynamic eta (characteristic life) conditioned on Health Index
        hi_factor = (health_index / 100.0) ** 1.6
        eta_cond = max(0.5, nominal_eta_years * hi_factor)

        # Weibull cumulative failure probability F(t) = 1 - exp(-(t / eta)^beta)
        exponent = -1.0 * ((age_years / eta_cond) ** beta)
        # Cap exponent to avoid underflow
        exponent = max(-100.0, min(0.0, exponent))
        prob = 1.0 - math.exp(exponent)
        return max(0.001, min(0.999, prob))
