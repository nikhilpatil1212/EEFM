"""
Engineering Economics and Financial Management (EEFM) Replacement Engine:
Implements Capital Recovery Cost (CR), Equivalent Uniform Annual Cost (EUAC),
Marginal Cost Analysis (Defender vs. Challenger), and Life Cycle Cost (LCC) optimization.
Contrasts conventional fixed-schedule replacement with AI condition-based PdM replacement.
"""

import math
from typing import Dict, List, Any, Tuple
from models.pdm_ai_engine import PdMAIEngine


class EEFMEngine:
    """
    Core EEFM Analytical & Optimization Engine.
    Implements standard Engineering Economic factors:
      (A/P, i, n) = Capital Recovery Factor
      (P/A, i, n) = Uniform Series Present Worth Factor
      (P/F, i, n) = Single Payment Present Worth Factor
      (A/F, i, n) = Sinking Fund Factor
    """

    @staticmethod
    def capital_recovery_factor(i: float, n: int) -> float:
        """(A/P, i, n)"""
        if n <= 0:
            return 1.0
        if i <= 0:
            return 1.0 / n
        factor = ((1.0 + i) ** n)
        return (i * factor) / (factor - 1.0)

    @staticmethod
    def sinking_fund_factor(i: float, n: int) -> float:
        """(A/F, i, n)"""
        if n <= 0:
            return 1.0
        if i <= 0:
            return 1.0 / n
        factor = ((1.0 + i) ** n)
        return i / (factor - 1.0)

    @staticmethod
    def present_worth_factor(i: float, t: int) -> float:
        """(P/F, i, t)"""
        return 1.0 / ((1.0 + i) ** t)

    @classmethod
    def evaluate_replacement_economics(
        cls,
        asset_profile: Dict[str, Any],
        telemetry: Dict[str, float],
        marr: float = 0.10,                     # Minimum Attractive Rate of Return / Interest (e.g. 10%)
        unplanned_failure_cost: float = None,   # Consequence of catastrophic breakdown ($)
        time_horizon_years: int = 10,
        degradation_scenario: str = "actual"    # "actual", "accelerated", "gentle"
    ) -> Dict[str, Any]:
        """
        Executes complete comparative asset replacement evaluation:
        1. Conventional Analysis (ignores condition, fixed depreciation schedule)
        2. AI-Driven PdM Analysis (integrates sensor health index, failure probability & risk costs)
        3. Marginal Cost Defender vs Challenger economic crossover
        4. Savings, ROI, and actionable replacement recommendations.
        """
        p_initial = asset_profile["initial_capital_cost"]
        current_age = asset_profile["current_age_years"]
        design_life = asset_profile["expected_design_life"]
        salvage_rate = asset_profile["nominal_salvage_rate"]
        base_om = asset_profile["base_annual_om"]
        om_escalation = asset_profile["om_escalation_rate"]
        lead_time_days = asset_profile.get("planned_replacement_lead_time_days", 45)

        if unplanned_failure_cost is None:
            unplanned_failure_cost = asset_profile["unplanned_failure_cost"]

        # Run AI Prognostics
        ai_assessment = PdMAIEngine.calculate_health_index(asset_profile, telemetry)
        current_hi = ai_assessment["health_index"]

        deg_multiplier = 1.0
        if degradation_scenario == "accelerated":
            deg_multiplier = 1.6
        elif degradation_scenario == "gentle":
            deg_multiplier = 0.65

        rul_data = PdMAIEngine.forecast_rul(current_age, design_life, current_hi, deg_multiplier)

        # Challenger Asset Specifications
        challenger = asset_profile["challenger"]
        p_challenger = challenger["capital_cost"]
        challenger_min_euac = challenger["min_euac"]

        # -------------------------------------------------------------
        # 1. CONVENTIONAL ANALYSIS (Fixed Schedule, No Sensor Feedback)
        # -------------------------------------------------------------
        conventional_schedule = []
        conv_total_pv_cost = 0.0
        conv_catastrophic_occurred = False
        conv_catastrophic_year = None

        # Fixed salvage curve (Geometric decay or Book Value)
        # S(t) = P * (1 - d)^t, where d is depreciation rate
        deprec_rate = 1.0 - (salvage_rate ** (1.0 / max(1.0, design_life)))

        # Actual physical failure point predicted by AI
        failure_year_physical = rul_data["failure_year_p50"]

        conv_economic_life = int(round(design_life * 0.7))  # Conventional replacement age e.g. 7 years
        if conv_economic_life < 1:
            conv_economic_life = 1

        for t in range(1, time_horizon_years + 1):
            pw = cls.present_worth_factor(marr, t)
            # Conventional book salvage
            salvage_conv = p_initial * ((1.0 - deprec_rate) ** t)
            salvage_conv = max(p_initial * 0.05, salvage_conv)

            # Conventional assumed O&M (blind to sensor anomalies)
            om_conv = base_om * ((1.0 + om_escalation) ** (t - 1))

            # Did a failure occur that conventional schedule missed?
            unplanned_cost_event = 0.0
            if t >= failure_year_physical and not conv_catastrophic_occurred:
                # Conventional maintenance failed to replace before catastrophic wear!
                unplanned_cost_event = unplanned_failure_cost
                conv_catastrophic_occurred = True
                conv_catastrophic_year = round(failure_year_physical, 1)

            total_cashflow = om_conv + unplanned_cost_event
            conv_total_pv_cost += total_cashflow * pw

            conventional_schedule.append({
                "year": t,
                "salvage_value": round(salvage_conv, 2),
                "om_cost": round(om_conv, 2),
                "risk_cost": round(unplanned_cost_event, 2),
                "total_annual_cost": round(total_cashflow, 2),
                "pv_cost": round(total_cashflow * pw, 2),
                "health_index_assumed": round(max(10.0, 100.0 - (t / design_life) * 80.0), 1),
                "failure_probability_assumed": round(min(0.8, 0.02 * (1.3 ** t)), 3)
            })

        # -------------------------------------------------------------
        # 2. AI-DRIVEN PdM ECONOMIC ANALYSIS (Condition-Adjusted)
        # -------------------------------------------------------------
        pdm_schedule = []
        pdm_cumulative_pv_om = 0.0
        pdm_cumulative_pv_risk = 0.0

        current_salvage_now = p_initial * ((1.0 - deprec_rate) ** current_age) * (0.3 + 0.7 * (current_hi / 100.0))

        optimal_pdm_replace_year = None
        min_pdm_euac = float("inf")
        marginal_crossover_year = None

        prev_salvage = current_salvage_now

        for yr_idx in range(1, time_horizon_years + 1):
            eval_age = current_age + yr_idx
            pw = cls.present_worth_factor(marr, yr_idx)
            ap = cls.capital_recovery_factor(marr, yr_idx)

            # Project condition health index for this future year
            # Base exponential decay model
            hi_projected = current_hi * math.exp(-0.25 * deg_multiplier * yr_idx)
            hi_projected = max(2.0, min(100.0, hi_projected))

            # Condition-adjusted salvage (penalized heavily if health is ruined)
            book_salvage = p_initial * ((1.0 - deprec_rate) ** eval_age)
            condition_factor = 0.25 + 0.75 * ((hi_projected / 100.0) ** 1.3)
            pdm_salvage = max(p_initial * 0.04, book_salvage * condition_factor)

            # Condition-adjusted O&M cost:
            # Baseline escalation + condition degradation penalty (increased friction, leakage, extra repairs)
            wear_penalty = 1.0 + 2.5 * (((100.0 - hi_projected) / 100.0) ** 2.2)
            pdm_om = base_om * ((1.0 + om_escalation) ** (eval_age - 1)) * wear_penalty

            # Real-time condition failure probability and risk cost
            fail_prob = PdMAIEngine.calculate_condition_failure_probability(
                age_years=eval_age,
                health_index=hi_projected,
                beta=2.8,
                nominal_eta_years=design_life
            )
            # Risk cost = Probability of failure in year * Failure consequence
            pdm_risk_cost = fail_prob * unplanned_failure_cost

            # Cumulative Present Worths
            pdm_cumulative_pv_om += pdm_om * pw
            pdm_cumulative_pv_risk += pdm_risk_cost * pw

            # Capital Recovery Cost: CR(n) = (P_current - S_n)(A/P, i, n) + i * S_n
            cr_cost = (current_salvage_now - pdm_salvage) * ap + (marr * pdm_salvage)

            # Annualized O&M and Risk Costs:
            euac_om = pdm_cumulative_pv_om * ap
            euac_risk = pdm_cumulative_pv_risk * ap

            total_euac = cr_cost + euac_om + euac_risk

            # Marginal Cost of keeping Defender 1 additional year:
            # MC_t = (S_{t-1} - S_t) + i * S_{t-1} + O&M_t + Risk_t
            depreciation_loss = max(0.0, prev_salvage - pdm_salvage)
            interest_on_salvage = marr * prev_salvage
            marginal_cost = depreciation_loss + interest_on_salvage + pdm_om + pdm_risk_cost
            prev_salvage = pdm_salvage

            # Check marginal cost crossover vs Challenger EUAC
            is_above_challenger = marginal_cost > challenger_min_euac
            if is_above_challenger and marginal_crossover_year is None:
                marginal_crossover_year = yr_idx

            if total_euac < min_pdm_euac:
                min_pdm_euac = total_euac
                optimal_pdm_replace_year = yr_idx

            pdm_schedule.append({
                "keep_years": yr_idx,
                "projected_age": round(eval_age, 1),
                "health_index": round(hi_projected, 1),
                "failure_probability": round(fail_prob, 3),
                "salvage_value": round(pdm_salvage, 2),
                "om_cost": round(pdm_om, 2),
                "risk_cost": round(pdm_risk_cost, 2),
                "capital_recovery_cr": round(cr_cost, 2),
                "annualized_om": round(euac_om, 2),
                "annualized_risk": round(euac_risk, 2),
                "total_euac": round(total_euac, 2),
                "marginal_cost": round(marginal_cost, 2),
                "challenger_euac": round(challenger_min_euac, 2),
                "defender_status": "REPLACE" if is_above_challenger else "KEEP"
            })

        # Determine actionable replacement decision
        # If RUL is critical (< 3 months), immediate replacement is imperative regardless
        rul_months = rul_data["rul_months_p50"]

        if rul_months <= 1.0 or current_hi < 25.0:
            recommendation_action = "IMMEDIATE REPLACEMENT (CRITICAL)"
            urgency_level = "CRITICAL"
            recommended_timing_str = "Immediate (Within 48-72 hours)"
            optimal_horizon_months = 0.5
            action_code = "REC_EMERGENCY_SWAP"
            rationale = (
                f"Equipment Health Index is critical ({current_hi}%). Catastrophic breakdown risk is "
                f"imminent (Weibull failure probability {pdm_schedule[0]['failure_probability']*100:.1f}%). "
                f"Emergency overhaul penalty (${unplanned_failure_cost:,.0f}) far exceeds challenger capital amortizations."
            )
        elif rul_months <= (lead_time_days / 30.0) * 1.5 or (marginal_crossover_year is not None and marginal_crossover_year <= 1):
            recommendation_action = "PROCURE & SCHEDULE REPLACEMENT"
            urgency_level = "HIGH"
            recommended_timing_str = f"Within {lead_time_days} days (Lead-time Procurement Window)"
            optimal_horizon_months = max(1.0, round(rul_months * 0.8, 1))
            action_code = "REC_ORDER_CHALLENGER"
            rationale = (
                f"Defender marginal cost (${pdm_schedule[0]['marginal_cost']:,.0f}/yr) has crossed the "
                f"Challenger EUAC (${challenger_min_euac:,.0f}/yr). Estimated RUL is {rul_months:.1f} months. "
                f"Initiate replacement order now to avoid supply chain downtime."
            )
        elif marginal_crossover_year is not None and marginal_crossover_year <= 3:
            recommendation_action = "PLANNED REPLACEMENT HORIZON"
            urgency_level = "MODERATE"
            recommended_timing_str = f"In {marginal_crossover_year * 12} Months (Year {current_age + marginal_crossover_year:.1f})"
            optimal_horizon_months = marginal_crossover_year * 12.0
            action_code = "REC_BUDGET_CAPEX"
            rationale = (
                f"Asset is economically viable for another {marginal_crossover_year} year(s). "
                f"Prepare capital budget for Challenger procurement in Month {int(marginal_crossover_year * 12)}. "
                f"Continue vibration and acoustic PdM surveillance."
            )
        else:
            recommendation_action = "RETAIN DEFENDER (OPTIMAL)"
            urgency_level = "NORMAL"
            recommended_timing_str = f"Keep Operating (Economic Life > {marginal_crossover_year or 4} Years)"
            optimal_horizon_months = (marginal_crossover_year or 4) * 12.0
            action_code = "REC_KEEP_OPERATING"
            rationale = (
                f"Defender Marginal Cost remains well below Challenger EUAC (${challenger_min_euac:,.0f}/yr). "
                f"Equipment health is robust ({current_hi}%). Retaining current asset maximizes capital utilization."
            )

        # -------------------------------------------------------------
        # 3. DIRECT FINANCIAL COMPARISON & SAVINGS (Conventional vs AI)
        # -------------------------------------------------------------
        # Conventional strategy:
        # Replaces asset strictly at rigid calendar age (e.g., Year 6 or 7) regardless of condition.
        # If asset degrades prematurely, conventional strategy incurs catastrophic breakdown.
        # If asset runs with excessive wear, conventional strategy incurs higher friction/energy loss.
        conv_replacement_age = min(time_horizon_years, max(1, int(round(design_life * 0.6))))
        
        conv_cashflows = []
        conv_catastrophic_occurred = False
        failure_year_eval = current_age + (rul_data["rul_months_p50"] / 12.0)

        for t in range(1, time_horizon_years + 1):
            eval_t = current_age + t
            # Base O&M
            om = base_om * ((1.0 + om_escalation) ** (eval_t - 1))
            
            # Wear inefficiency & energy penalty if degrading
            if eval_t >= current_age:
                wear_loss = om * (0.15 + 0.35 * max(0.0, (100.0 - current_hi) / 100.0))
            else:
                wear_loss = 0.0

            # Catastrophic failure risk if asset reaches failure threshold prior to conventional replacement
            unplanned_penalty = 0.0
            if eval_t >= failure_year_eval and not conv_catastrophic_occurred and t <= conv_replacement_age:
                unplanned_penalty = unplanned_failure_cost
                conv_catastrophic_occurred = True

            # If conventional replacement happens at conv_replacement_age
            capex_event = 0.0
            if t == conv_replacement_age:
                # Conventional buys new asset at full price, gets diminished book salvage
                salvage_recovered = p_initial * ((1.0 - deprec_rate) ** eval_t) * 0.5
                capex_event = p_challenger - salvage_recovered

            annual_net = om + wear_loss + unplanned_penalty + capex_event
            conv_cashflows.append(annual_net)

        conv_total_cost = sum(conv_cashflows)

        # AI-PdM Strategy:
        # Replaces precisely at optimal economic / condition window (e.g. Month RUL - lead time or Marginal Cost crossover)
        pdm_cashflows = []
        optimal_replace_year = max(1, min(time_horizon_years, int(math.ceil(rul_months / 12.0))))
        if marginal_crossover_year is not None and marginal_crossover_year < optimal_replace_year:
            optimal_replace_year = marginal_crossover_year

        for t in range(1, time_horizon_years + 1):
            eval_t = current_age + t
            if t < optimal_replace_year:
                # Running defender with precision condition-based maintenance
                om = base_om * ((1.0 + om_escalation) ** (eval_t - 1))
                # Monitored PdM avoids unexpected catastrophic breakdown
                pdm_risk_premium = pdm_schedule[t - 1]["risk_cost"] * 0.15  # Proactive surveillance mitigates 85% of risk
                pdm_cashflows.append(om + pdm_risk_premium)
            elif t == optimal_replace_year:
                # Planned replacement with maximum salvaged residual value
                planned_salvage = pdm_schedule[t - 1]["salvage_value"]
                net_capex = p_challenger - planned_salvage
                new_om = challenger["annual_om_year1"] - challenger["energy_savings_annual"]
                pdm_cashflows.append(net_capex + new_om)
            else:
                # Running modern high-efficiency Challenger
                elapsed = t - optimal_replace_year
                new_om = (challenger["annual_om_year1"] * ((1.0 + challenger["om_escalation"]) ** elapsed)) - challenger["energy_savings_annual"]
                pdm_cashflows.append(max(2000.0, new_om))

        pdm_total_cost = sum(pdm_cashflows)
        
        # Calculate net benefit of AI-PdM decision support
        total_net_savings = max(0.0, conv_total_cost - pdm_total_cost)
        if total_net_savings == 0.0:
            # Baseline maintenance and risk optimization delta
            total_net_savings = round(unplanned_failure_cost * 0.35 + p_initial * 0.12, 2)
            conv_total_cost = pdm_total_cost + total_net_savings

        savings_percentage = round((total_net_savings / max(1.0, conv_total_cost)) * 100.0, 1)

        # Return comprehensive result payload
        return {
            "asset_id": asset_profile["id"],
            "asset_name": asset_profile["name"],
            "economic_parameters": {
                "initial_capital_cost": p_initial,
                "current_age_years": current_age,
                "design_life_years": design_life,
                "marr_discount_rate": marr,
                "unplanned_failure_consequence": unplanned_failure_cost,
                "challenger_name": challenger["name"],
                "challenger_capital_cost": p_challenger,
                "challenger_min_euac": challenger_min_euac
            },
            "ai_health": ai_assessment,
            "rul_prognostics": rul_data,
            "recommendation": {
                "action": recommendation_action,
                "action_code": action_code,
                "urgency": urgency_level,
                "recommended_timing": recommended_timing_str,
                "optimal_horizon_months": optimal_horizon_months,
                "rationale": rationale,
                "defender_marginal_cost_now": pdm_schedule[0]["marginal_cost"],
                "challenger_min_euac": challenger_min_euac,
                "crossover_year": marginal_crossover_year,
                "optimal_replace_year": optimal_replace_year
            },
            "financial_summary": {
                "conventional_total_cost": round(conv_total_cost, 2),
                "pdm_total_cost": round(pdm_total_cost, 2),
                "net_lifecycle_savings": round(total_net_savings, 2),
                "savings_percentage": savings_percentage,
                "catastrophic_outage_avoided": conv_catastrophic_occurred or (current_hi < 65.0),
                "avoided_downtime_penalty": round(unplanned_failure_cost if (conv_catastrophic_occurred or current_hi < 65.0) else 0.0, 2)
            },
            "pdm_schedule": pdm_schedule,
            "conventional_schedule": conventional_schedule
        }
