"""
Asset profiles and telemetry metadata for the AI-Driven Asset Replacement Decision Support Tool.
Covers real-world industrial archetypes with sensor baseline specifications and economic parameters.
"""

from typing import Dict, List, Any

ASSET_PRESETS: Dict[str, Dict[str, Any]] = {
    "centrifugal_pump": {
        "id": "centrifugal_pump",
        "name": "High-Pressure Feedwater Boiler Pump (600 kW)",
        "category": "Fluid Machinery",
        "criticality": "High (Base-load Plant)",
        "initial_capital_cost": 185000.0,       # Initial Cost P ($)
        "current_age_years": 4.5,               # Current operating age (years)
        "expected_design_life": 10.0,           # Design life (years)
        "nominal_salvage_rate": 0.12,           # Baseline salvage value fraction
        "base_annual_om": 14000.0,              # Baseline O&M at year 1 ($)
        "om_escalation_rate": 0.08,             # Annual O&M escalation rate g
        "unplanned_failure_cost": 195000.0,     # Emergency overhaul + downtime loss ($)
        "planned_replacement_lead_time_days": 45,
        "challenger": {
            "name": "Ultra-Efficiency IE4 Smart Variable-Flow Pump",
            "capital_cost": 210000.0,
            "annual_om_year1": 9500.0,
            "om_escalation": 0.05,
            "energy_savings_annual": 16500.0,
            "economic_life_years": 8.0,
            "salvage_at_economic_life": 32000.0,
            "min_euac": 42100.0
        },
        "sensors": {
            "vibration_rms": {
                "name": "Vibration Velocity RMS",
                "unit": "mm/s",
                "baseline": 2.2,
                "warning": 4.5,
                "critical": 7.1,
                "weight": 0.28,
                "category": "Mechanical Wear"
            },
            "bearing_temp": {
                "name": "NDE Bearing Temperature",
                "unit": "°C",
                "baseline": 62.0,
                "warning": 85.0,
                "critical": 105.0,
                "weight": 0.22,
                "category": "Thermal Stress"
            },
            "acoustic_emission": {
                "name": "Acoustic Cavitation Intensity",
                "unit": "dB",
                "baseline": 48.0,
                "warning": 72.0,
                "critical": 88.0,
                "weight": 0.20,
                "category": "Fluid Dynamics"
            },
            "seal_leakage_flow": {
                "name": "Mechanical Seal Leak Rate",
                "unit": "mL/min",
                "baseline": 1.5,
                "warning": 8.0,
                "critical": 18.0,
                "weight": 0.16,
                "category": "Component Degradation"
            },
            "oil_particle_ppm": {
                "name": "Lube Contamination (ISO Code)",
                "unit": "ppm",
                "baseline": 35.0,
                "warning": 120.0,
                "critical": 260.0,
                "weight": 0.14,
                "category": "Tribology"
            }
        }
    },
    "cnc_spindle": {
        "id": "cnc_spindle",
        "name": "5-Axis High-Speed Milling Spindle (24,000 RPM)",
        "category": "Precision Manufacturing",
        "criticality": "Critical (Automotive Powertrain Line)",
        "initial_capital_cost": 92000.0,
        "current_age_years": 3.2,
        "expected_design_life": 7.0,
        "nominal_salvage_rate": 0.08,
        "base_annual_om": 8500.0,
        "om_escalation_rate": 0.11,
        "unplanned_failure_cost": 145000.0,     # Production line stoppage penalty ($12k/hr)
        "planned_replacement_lead_time_days": 21,
        "challenger": {
            "name": "Hybrid Ceramic Direct-Drive Smart Spindle",
            "capital_cost": 105000.0,
            "annual_om_year1": 5200.0,
            "om_escalation": 0.06,
            "energy_savings_annual": 8200.0,
            "economic_life_years": 6.0,
            "salvage_at_economic_life": 16000.0,
            "min_euac": 26400.0
        },
        "sensors": {
            "vibration_rms": {
                "name": "Spindle Radial Vibration",
                "unit": "mm/s",
                "baseline": 0.8,
                "warning": 2.2,
                "critical": 4.5,
                "weight": 0.32,
                "category": "Kinematic Precision"
            },
            "bearing_temp": {
                "name": "Front Hybrid Bearing Temp",
                "unit": "°C",
                "baseline": 44.0,
                "warning": 68.0,
                "critical": 85.0,
                "weight": 0.25,
                "category": "Thermal Expansion"
            },
            "runout_microns": {
                "name": "Dynamic Tool-Tip Runout",
                "unit": "µm",
                "baseline": 1.8,
                "warning": 6.5,
                "critical": 12.0,
                "weight": 0.25,
                "category": "Geometric Precision"
            },
            "motor_harmonic_thd": {
                "name": "Motor Current Harmonic Distortion",
                "unit": "%",
                "baseline": 2.1,
                "warning": 6.0,
                "critical": 11.5,
                "weight": 0.18,
                "category": "Electromechanical"
            }
        }
    },
    "gas_turbine": {
        "id": "gas_turbine",
        "name": "Heavy-Duty Aeroderivative Gas Turbine (32 MW)",
        "category": "Turbomachinery / Power Gen",
        "criticality": "Severe (Peak-load Grid Anchor)",
        "initial_capital_cost": 2800000.0,
        "current_age_years": 7.0,
        "expected_design_life": 15.0,
        "nominal_salvage_rate": 0.15,
        "base_annual_om": 165000.0,
        "om_escalation_rate": 0.09,
        "unplanned_failure_cost": 2200000.0,    # Catastrophic blade liberation + grid outage
        "planned_replacement_lead_time_days": 90,
        "challenger": {
            "name": "Next-Gen H-Class Low-NOx Fast-Start Turbine",
            "capital_cost": 3150000.0,
            "annual_om_year1": 110000.0,
            "om_escalation": 0.05,
            "energy_savings_annual": 210000.0,
            "economic_life_years": 12.0,
            "salvage_at_economic_life": 580000.0,
            "min_euac": 485000.0
        },
        "sensors": {
            "vibration_rms": {
                "name": "Turbine Casing Vibration",
                "unit": "mm/s",
                "baseline": 3.1,
                "warning": 8.0,
                "critical": 15.0,
                "weight": 0.30,
                "category": "Rotor Dynamics"
            },
            "bearing_temp": {
                "name": "Exhaust Gas Temp (EGT) Spread",
                "unit": "°C",
                "baseline": 28.0,
                "warning": 58.0,
                "critical": 95.0,
                "weight": 0.28,
                "category": "Combustion Profile"
            },
            "blade_strain_micro": {
                "name": "Stage-1 Rotor Blade Creep Strain",
                "unit": "µε",
                "baseline": 420.0,
                "warning": 850.0,
                "critical": 1350.0,
                "weight": 0.24,
                "category": "Metallurgical Fatigue"
            },
            "lube_ferrous_density": {
                "name": "Lube Oil Ferrous Debris Index",
                "unit": "mg/L",
                "baseline": 8.0,
                "warning": 35.0,
                "critical": 78.0,
                "weight": 0.18,
                "category": "Bearing Spalling"
            }
        }
    },
    "wind_gearbox": {
        "id": "wind_gearbox",
        "name": "3.6 MW Offshore Wind Turbine Planetary Gearbox",
        "category": "Renewable Power",
        "criticality": "High (Offshore Crane Vessel Logistics)",
        "initial_capital_cost": 420000.0,
        "current_age_years": 5.8,
        "expected_design_life": 12.0,
        "nominal_salvage_rate": 0.10,
        "base_annual_om": 38000.0,
        "om_escalation_rate": 0.12,
        "unplanned_failure_cost": 540000.0,     # Offshore vessel charter + lost generation
        "planned_replacement_lead_time_days": 60,
        "challenger": {
            "name": "Direct-Drive Permanent Magnet Generator (Gearless)",
            "capital_cost": 490000.0,
            "annual_om_year1": 18000.0,
            "om_escalation": 0.04,
            "energy_savings_annual": 32000.0,
            "economic_life_years": 10.0,
            "salvage_at_economic_life": 65000.0,
            "min_euac": 76500.0
        },
        "sensors": {
            "vibration_rms": {
                "name": "Planetary Gearmesh Acceleration",
                "unit": "g pk",
                "baseline": 1.2,
                "warning": 3.8,
                "critical": 7.5,
                "weight": 0.35,
                "category": "Gearmesh Kinematics"
            },
            "bearing_temp": {
                "name": "High-Speed Intermediate Bearing Temp",
                "unit": "°C",
                "baseline": 55.0,
                "warning": 82.0,
                "critical": 102.0,
                "weight": 0.25,
                "category": "Friction Overheat"
            },
            "oil_particle_ppm": {
                "name": "Micronic Particle Count > 4µm",
                "unit": "particles/mL",
                "baseline": 1200.0,
                "warning": 4800.0,
                "critical": 12500.0,
                "weight": 0.22,
                "category": "Surface Pitting"
            },
            "acoustic_emission": {
                "name": "White Etch Crack Acoustic Index",
                "unit": "dB",
                "baseline": 36.0,
                "warning": 65.0,
                "critical": 84.0,
                "weight": 0.18,
                "category": "Micro-crack Propagation"
            }
        }
    },
    "substation_transformer": {
        "id": "substation_transformer",
        "name": "Main Step-Down Power Transformer (50 MVA, 132/33 kV)",
        "category": "Electrical Transmission",
        "criticality": "Extreme (Regional Substation Grid Node)",
        "initial_capital_cost": 1150000.0,
        "current_age_years": 18.0,
        "expected_design_life": 30.0,
        "nominal_salvage_rate": 0.18,
        "base_annual_om": 32000.0,
        "om_escalation_rate": 0.07,
        "unplanned_failure_cost": 1800000.0,    # Catastrophic tank explosion + blackouts
        "planned_replacement_lead_time_days": 120,
        "challenger": {
            "name": "Ester-Fluid Smart Transformer with Optical DGA",
            "capital_cost": 1380000.0,
            "annual_om_year1": 19000.0,
            "om_escalation": 0.04,
            "energy_savings_annual": 48000.0,
            "economic_life_years": 25.0,
            "salvage_at_economic_life": 280000.0,
            "min_euac": 128000.0
        },
        "sensors": {
            "dissolved_gas_c2h2": {
                "name": "Acetylene Gas (C2H2) - Arc Fault",
                "unit": "ppm",
                "baseline": 0.4,
                "warning": 4.0,
                "critical": 15.0,
                "weight": 0.35,
                "category": "Dielectric Arcing"
            },
            "bearing_temp": {
                "name": "Top Oil & Winding Hotspot Temp",
                "unit": "°C",
                "baseline": 65.0,
                "warning": 98.0,
                "critical": 122.0,
                "weight": 0.25,
                "category": "Thermal Overload"
            },
            "moisture_in_oil": {
                "name": "Moisture in Dielectric Oil",
                "unit": "ppm",
                "baseline": 12.0,
                "warning": 28.0,
                "critical": 45.0,
                "weight": 0.22,
                "category": "Insulation Degradation"
            },
            "furan_compounds": {
                "name": "Furan Concentration (Paper Aging)",
                "unit": "mg/L",
                "baseline": 0.15,
                "warning": 1.2,
                "critical": 3.5,
                "weight": 0.18,
                "category": "Cellulose Depolymerization"
            }
        }
    }
}
