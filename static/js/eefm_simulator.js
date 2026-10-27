/**
 * EEFM & Predictive Maintenance Client-Side Mathematical Simulation Engine
 * Runs 100% offline or as a zero-latency accelerator for the web UI.
 */

const EEFMSimulator = (function() {

  // Industrial Asset Presets
  const ASSETS = {
    centrifugal_pump: {
      id: "centrifugal_pump",
      name: "High-Pressure Feedwater Boiler Pump (600 kW)",
      category: "Fluid Machinery",
      criticality: "High (Base-load Plant)",
      initial_capital_cost: 185000.0,
      current_age_years: 4.5,
      expected_design_life: 10.0,
      nominal_salvage_rate: 0.12,
      base_annual_om: 14000.0,
      om_escalation_rate: 0.08,
      unplanned_failure_cost: 195000.0,
      planned_replacement_lead_time_days: 45,
      challenger: {
        name: "Ultra-Efficiency IE4 Smart Variable-Flow Pump",
        capital_cost: 210000.0,
        annual_om_year1: 9500.0,
        om_escalation: 0.05,
        energy_savings_annual: 16500.0,
        economic_life_years: 8.0,
        salvage_at_economic_life: 32000.0,
        min_euac: 42100.0
      },
      sensors: {
        vibration_rms: { name: "Vibration Velocity RMS", unit: "mm/s", baseline: 2.2, warning: 4.5, critical: 7.1, weight: 0.28, category: "Mechanical Wear" },
        bearing_temp: { name: "NDE Bearing Temperature", unit: "°C", baseline: 62.0, warning: 85.0, critical: 105.0, weight: 0.22, category: "Thermal Stress" },
        acoustic_emission: { name: "Acoustic Cavitation Intensity", unit: "dB", baseline: 48.0, warning: 72.0, critical: 88.0, weight: 0.20, category: "Fluid Dynamics" },
        seal_leakage_flow: { name: "Mechanical Seal Leak Rate", unit: "mL/min", baseline: 1.5, warning: 8.0, critical: 18.0, weight: 0.16, category: "Component Degradation" },
        oil_particle_ppm: { name: "Lube Contamination (ISO Code)", unit: "ppm", baseline: 35.0, warning: 120.0, critical: 260.0, weight: 0.14, category: "Tribology" }
      }
    },
    cnc_spindle: {
      id: "cnc_spindle",
      name: "5-Axis High-Speed Milling Spindle (24,000 RPM)",
      category: "Precision Manufacturing",
      criticality: "Critical (Automotive Powertrain Line)",
      initial_capital_cost: 92000.0,
      current_age_years: 3.2,
      expected_design_life: 7.0,
      nominal_salvage_rate: 0.08,
      base_annual_om: 8500.0,
      om_escalation_rate: 0.11,
      unplanned_failure_cost: 145000.0,
      planned_replacement_lead_time_days: 21,
      challenger: {
        name: "Hybrid Ceramic Direct-Drive Smart Spindle",
        capital_cost: 105000.0,
        annual_om_year1: 5200.0,
        om_escalation: 0.06,
        energy_savings_annual: 8200.0,
        economic_life_years: 6.0,
        salvage_at_economic_life: 16000.0,
        min_euac: 26400.0
      },
      sensors: {
        vibration_rms: { name: "Spindle Radial Vibration", unit: "mm/s", baseline: 0.8, warning: 2.2, critical: 4.5, weight: 0.32, category: "Kinematic Precision" },
        bearing_temp: { name: "Front Hybrid Bearing Temp", unit: "°C", baseline: 44.0, warning: 68.0, critical: 85.0, weight: 0.25, category: "Thermal Expansion" },
        runout_microns: { name: "Dynamic Tool-Tip Runout", unit: "µm", baseline: 1.8, warning: 6.5, critical: 12.0, weight: 0.25, category: "Geometric Precision" },
        motor_harmonic_thd: { name: "Motor Current Harmonic Distortion", unit: "%", baseline: 2.1, warning: 6.0, critical: 11.5, weight: 0.18, category: "Electromechanical" }
      }
    },
    gas_turbine: {
      id: "gas_turbine",
      name: "Heavy-Duty Aeroderivative Gas Turbine (32 MW)",
      category: "Turbomachinery / Power Gen",
      criticality: "Severe (Peak-load Grid Anchor)",
      initial_capital_cost: 2800000.0,
      current_age_years: 7.0,
      expected_design_life: 15.0,
      nominal_salvage_rate: 0.15,
      base_annual_om: 165000.0,
      om_escalation_rate: 0.09,
      unplanned_failure_cost: 2200000.0,
      planned_replacement_lead_time_days: 90,
      challenger: {
        name: "Next-Gen H-Class Low-NOx Fast-Start Turbine",
        capital_cost: 3150000.0,
        annual_om_year1: 110000.0,
        om_escalation: 0.05,
        energy_savings_annual: 210000.0,
        economic_life_years: 12.0,
        salvage_at_economic_life: 580000.0,
        min_euac: 485000.0
      },
      sensors: {
        vibration_rms: { name: "Turbine Casing Vibration", unit: "mm/s", baseline: 3.1, warning: 8.0, critical: 15.0, weight: 0.30, category: "Rotor Dynamics" },
        bearing_temp: { name: "Exhaust Gas Temp (EGT) Spread", unit: "°C", baseline: 28.0, warning: 58.0, critical: 95.0, weight: 0.28, category: "Combustion Profile" },
        blade_strain_micro: { name: "Stage-1 Rotor Blade Creep Strain", unit: "µε", baseline: 420.0, warning: 850.0, critical: 1350.0, weight: 0.24, category: "Metallurgical Fatigue" },
        lube_ferrous_density: { name: "Lube Oil Ferrous Debris Index", unit: "mg/L", baseline: 8.0, warning: 35.0, critical: 78.0, weight: 0.18, category: "Bearing Spalling" }
      }
    },
    wind_gearbox: {
      id: "wind_gearbox",
      name: "3.6 MW Offshore Wind Turbine Planetary Gearbox",
      category: "Renewable Power",
      criticality: "High (Offshore Crane Vessel Logistics)",
      initial_capital_cost: 420000.0,
      current_age_years: 5.8,
      expected_design_life: 12.0,
      nominal_salvage_rate: 0.10,
      base_annual_om: 38000.0,
      om_escalation_rate: 0.12,
      unplanned_failure_cost: 540000.0,
      planned_replacement_lead_time_days: 60,
      challenger: {
        name: "Direct-Drive Permanent Magnet Generator (Gearless)",
        capital_cost: 490000.0,
        annual_om_year1: 18000.0,
        om_escalation: 0.04,
        energy_savings_annual: 32000.0,
        economic_life_years: 10.0,
        salvage_at_economic_life: 65000.0,
        min_euac: 76500.0
      },
      sensors: {
        vibration_rms: { name: "Planetary Gearmesh Acceleration", unit: "g pk", baseline: 1.2, warning: 3.8, critical: 7.5, weight: 0.35, category: "Gearmesh Kinematics" },
        bearing_temp: { name: "High-Speed Intermediate Bearing Temp", unit: "°C", baseline: 55.0, warning: 82.0, critical: 102.0, weight: 0.25, category: "Friction Overheat" },
        oil_particle_ppm: { name: "Micronic Particle Count > 4µm", unit: "particles/mL", baseline: 1200.0, warning: 4800.0, critical: 12500.0, weight: 0.22, category: "Surface Pitting" },
        acoustic_emission: { name: "White Etch Crack Acoustic Index", unit: "dB", baseline: 36.0, warning: 65.0, critical: 84.0, weight: 0.18, category: "Micro-crack Propagation" }
      }
    },
    substation_transformer: {
      id: "substation_transformer",
      name: "Main Step-Down Power Transformer (50 MVA, 132/33 kV)",
      category: "Electrical Transmission",
      criticality: "Extreme (Regional Substation Grid Node)",
      initial_capital_cost: 1150000.0,
      current_age_years: 18.0,
      expected_design_life: 30.0,
      nominal_salvage_rate: 0.18,
      base_annual_om: 32000.0,
      om_escalation_rate: 0.07,
      unplanned_failure_cost: 1800000.0,
      planned_replacement_lead_time_days: 120,
      challenger: {
        name: "Ester-Fluid Smart Transformer with Optical DGA",
        capital_cost: 1380000.0,
        annual_om_year1: 19000.0,
        om_escalation: 0.04,
        energy_savings_annual: 48000.0,
        economic_life_years: 25.0,
        salvage_at_economic_life: 280000.0,
        min_euac: 128000.0
      },
      sensors: {
        dissolved_gas_c2h2: { name: "Acetylene Gas (C2H2) - Arc Fault", unit: "ppm", baseline: 0.4, warning: 4.0, critical: 15.0, weight: 0.35, category: "Dielectric Arcing" },
        bearing_temp: { name: "Top Oil & Winding Hotspot Temp", unit: "°C", baseline: 65.0, warning: 98.0, critical: 122.0, weight: 0.25, category: "Thermal Overload" },
        moisture_in_oil: { name: "Moisture in Dielectric Oil", unit: "ppm", baseline: 12.0, warning: 28.0, critical: 45.0, weight: 0.22, category: "Insulation Degradation" },
        furan_compounds: { name: "Furan Concentration (Paper Aging)", unit: "mg/L", baseline: 0.15, warning: 1.2, critical: 3.5, weight: 0.18, category: "Cellulose Depolymerization" }
      }
    }
  };

  // Capital Recovery Factor: (A/P, i, n)
  function crf(i, n) {
    if (n <= 0) return 1.0;
    if (i <= 0) return 1.0 / n;
    const factor = Math.pow(1.0 + i, n);
    return (i * factor) / (factor - 1.0);
  }

  // Present Worth Factor: (P/F, i, t)
  function pwf(i, t) {
    return 1.0 / Math.pow(1.0 + i, t);
  }

  // AI Health Index Calculation
  function computeHealthIndex(asset, telemetry) {
    const sensors = asset.sensors;
    let totalPenalty = 0.0;
    const attributions = {};

    for (const [key, spec] of Object.entries(sensors)) {
      const val = telemetry[key] !== undefined ? telemetry[key] : spec.baseline;
      const baseline = spec.baseline;
      const warning = spec.warning;
      const critical = spec.critical;
      const weight = spec.weight;

      let ratio = 0.0;
      if (val <= baseline) {
        ratio = 0.0;
      } else if (val <= warning) {
        ratio = 0.4 * ((val - baseline) / Math.max(1e-6, warning - baseline));
      } else if (val <= critical) {
        ratio = 0.4 + 0.6 * ((val - warning) / Math.max(1e-6, critical - warning));
      } else {
        ratio = 1.0 + 0.5 * ((val - critical) / Math.max(1e-6, critical - warning));
      }

      const pen = weight * Math.pow(ratio, 1.85);
      totalPenalty += pen;

      attributions[key] = {
        name: spec.name,
        unit: spec.unit,
        current_value: Math.round(val * 100) / 100,
        baseline: baseline,
        warning: warning,
        critical: critical,
        weight: weight,
        stress_ratio: Math.round(ratio * 1000) / 1000,
        contribution_pct: 0.0,
        category: spec.category
      };
    }

    let hi = 100.0 * Math.exp(-1.45 * totalPenalty);
    hi = Math.max(1.0, Math.min(100.0, hi));

    if (totalPenalty > 0) {
      for (const [key, attr] of Object.entries(attributions)) {
        const p = attr.weight * Math.pow(attr.stress_ratio, 1.85);
        attr.contribution_pct = Math.round((p / totalPenalty) * 1000) / 10;
      }
    } else {
      const share = Math.round(1000 / Object.keys(attributions).length) / 10;
      for (const attr of Object.values(attributions)) {
        attr.contribution_pct = share;
      }
    }

    let status = "HEALTHY";
    let status_color = "#387653";
    let severity_desc = "Optimal operating state with negligible wear accumulation.";

    if (hi >= 85.0) {
      status = "HEALTHY";
      status_color = "#387653";
    } else if (hi >= 70.0) {
      status = "NORMAL_WEAR";
      status_color = "#777C54";
      severity_desc = "Standard progressive wear within engineering tolerances.";
    } else if (hi >= 50.0) {
      status = "INCIPIENT_FAULT";
      status_color = "#C18A35";
      severity_desc = "Detectable sub-surface degradation; thermal/vibrational anomaly.";
    } else if (hi >= 30.0) {
      status = "SEVERE_DEGRADATION";
      status_color = "#C65D35";
      severity_desc = "Accelerated wear; imminent danger of cascading damage.";
    } else {
      status = "CRITICAL_IMMINENT_FAILURE";
      status_color = "#B8473C";
      severity_desc = "Extreme failure probability; immediate economic and physical hazard.";
    }

    return {
      health_index: Math.round(hi * 10) / 10,
      status: status,
      status_color: status_color,
      severity_desc: severity_desc,
      total_penalty: Math.round(totalPenalty * 1000) / 1000,
      feature_attributions: attributions
    };
  }

  // RUL Prognostics
  function forecastRUL(age, designLife, hi, degMultiplier = 1.0) {
    const threshold = 20.0;
    if (hi <= threshold) {
      return {
        rul_months_p50: 0.5,
        rul_months_p10: 0.1,
        rul_months_p90: 1.2,
        rul_years_p50: 0.04,
        failure_year_p50: Math.round((age + 0.04) * 100) / 100,
        forecast_trajectory: [{ month_offset: 0, hi_p50: hi, hi_p10: hi, hi_p90: hi }]
      };
    }

    const baseLambda = 1.6094 / Math.max(1.0, designLife);
    const expectedHi = 100.0 * Math.exp(-baseLambda * age);
    const accel = Math.max(0.6, (100.0 - hi) / Math.max(5.0, 100.0 - expectedHi));
    const effectiveLambda = baseLambda * accel * degMultiplier;

    const rulYears = Math.log(hi / threshold) / Math.max(0.01, effectiveLambda);
    const rulMonths = Math.max(0.2, rulYears * 12.0);

    const volatility = 0.22 * Math.sqrt(Math.max(0.5, rulYears));
    const rulP10 = Math.max(0.1, rulMonths * Math.exp(-1.28 * volatility));
    const rulP90 = rulMonths * Math.exp(1.28 * volatility);

    const traj = [];
    const maxM = Math.min(48, Math.ceil(rulP90) + 6);
    for (let m = 0; m <= maxM; m += 2) {
      const tYr = m / 12.0;
      const h = hi * Math.exp(-effectiveLambda * tYr);
      traj.push({
        month_offset: m,
        projected_age_years: Math.round((age + tYr) * 10) / 10,
        hi_p50: Math.round(Math.max(5.0, Math.min(100.0, h)) * 10) / 10,
        hi_p10: Math.round(Math.max(5.0, Math.min(100.0, h * Math.exp(-0.2 * Math.sqrt(tYr + 0.1)))) * 10) / 10,
        hi_p90: Math.round(Math.max(5.0, Math.min(100.0, h * Math.exp(0.2 * Math.sqrt(tYr + 0.1)))) * 10) / 10
      });
    }

    return {
      rul_months_p50: Math.round(rulMonths * 10) / 10,
      rul_months_p10: Math.round(rulP10 * 10) / 10,
      rul_months_p90: Math.round(rulP90 * 10) / 10,
      rul_years_p50: Math.round(rulYears * 100) / 100,
      failure_year_p50: Math.round((age + rulYears) * 100) / 100,
      forecast_trajectory: traj
    };
  }

  // Weibull Failure Probability
  function weibullFailureProb(age, hi, beta = 2.8, nominalEta = 10.0) {
    const factor = Math.pow(hi / 100.0, 1.6);
    const etaCond = Math.max(0.5, nominalEta * factor);
    const exponent = -Math.pow(age / etaCond, beta);
    const prob = 1.0 - Math.exp(Math.max(-80.0, exponent));
    return Math.max(0.001, Math.min(0.999, prob));
  }

  // Main Comprehensive EEFM Evaluation
  function evaluate(assetId, telemetry, marr = 0.10, failureCostOverride = null, degradationScenario = "actual") {
    const asset = ASSETS[assetId] || ASSETS.centrifugal_pump;
    const P = asset.initial_capital_cost;
    const currentAge = asset.current_age_years;
    const designLife = asset.expected_design_life;
    const salvageRate = asset.nominal_salvage_rate;
    const baseOM = asset.base_annual_om;
    const omEscalation = asset.om_escalation_rate;
    const leadTimeDays = asset.planned_replacement_lead_time_days;
    const unplannedCost = failureCostOverride !== null ? failureCostOverride : asset.unplanned_failure_cost;

    // AI Health Assessment
    const aiAssessment = computeHealthIndex(asset, telemetry);
    const currentHI = aiAssessment.health_index;

    let degMult = 1.0;
    if (degradationScenario === "accelerated") degMult = 1.6;
    if (degradationScenario === "gentle") degMult = 0.65;

    const rulData = forecastRUL(currentAge, designLife, currentHI, degMult);

    const challenger = asset.challenger;
    const pChallenger = challenger.capital_cost;
    const challengerMinEUAC = challenger.min_euac;

    // Depreciation rate
    const deprecRate = 1.0 - Math.pow(salvageRate, 1.0 / Math.max(1.0, designLife));

    const horizon = 10;
    const pdmSchedule = [];
    const convSchedule = [];

    // Current Defender Salvage Value
    const currentSalvageNow = P * Math.pow(1.0 - deprecRate, currentAge) * (0.3 + 0.7 * (currentHI / 100.0));

    let prevSalvage = currentSalvageNow;
    let minPdmEUAC = Infinity;
    let optimalPdmYear = 1;
    let marginalCrossoverYear = null;

    let cumPvOM = 0.0;
    let cumPvRisk = 0.0;

    for (let yr = 1; yr <= horizon; yr++) {
      const evalAge = currentAge + yr;
      const pw = pwf(marr, yr);
      const ap = crf(marr, yr);

      // Projected HI
      let hiProj = currentHI * Math.exp(-0.25 * degMult * yr);
      hiProj = Math.max(2.0, Math.min(100.0, hiProj));

      // Salvage condition-adjusted
      const bookSalvage = P * Math.pow(1.0 - deprecRate, evalAge);
      const condFactor = 0.25 + 0.75 * Math.pow(hiProj / 100.0, 1.3);
      const pdmSalvage = Math.max(P * 0.04, bookSalvage * condFactor);

      // Condition O&M
      const wearPenalty = 1.0 + 2.5 * Math.pow((100.0 - hiProj) / 100.0, 2.2);
      const pdmOM = baseOM * Math.pow(1.0 + omEscalation, evalAge - 1) * wearPenalty;

      // Real-time failure prob & risk cost
      const failProb = weibullFailureProb(evalAge, hiProj, 2.8, designLife);
      const pdmRiskCost = failProb * unplannedCost;

      cumPvOM += pdmOM * pw;
      cumPvRisk += pdmRiskCost * pw;

      // Capital recovery
      const crCost = (currentSalvageNow - pdmSalvage) * ap + (marr * pdmSalvage);
      const euacOM = cumPvOM * ap;
      const euacRisk = cumPvRisk * ap;
      const totalEUAC = crCost + euacOM + euacRisk;

      // Marginal Cost: (S_{t-1} - S_t) + i*S_{t-1} + O&M + Risk
      const depLoss = Math.max(0.0, prevSalvage - pdmSalvage);
      const interestOnSalvage = marr * prevSalvage;
      const marginalCost = depLoss + interestOnSalvage + pdmOM + pdmRiskCost;
      prevSalvage = pdmSalvage;

      const isAboveChallenger = marginalCost > challengerMinEUAC;
      if (isAboveChallenger && marginalCrossoverYear === null) {
        marginalCrossoverYear = yr;
      }

      if (totalEUAC < minPdmEUAC) {
        minPdmEUAC = totalEUAC;
        optimalPdmYear = yr;
      }

      pdmSchedule.push({
        keep_years: yr,
        projected_age: Math.round(evalAge * 10) / 10,
        health_index: Math.round(hiProj * 10) / 10,
        failure_probability: Math.round(failProb * 1000) / 1000,
        salvage_value: Math.round(pdmSalvage),
        om_cost: Math.round(pdmOM),
        risk_cost: Math.round(pdmRiskCost),
        capital_recovery_cr: Math.round(crCost),
        annualized_om: Math.round(euacOM),
        annualized_risk: Math.round(euacRisk),
        total_euac: Math.round(totalEUAC),
        marginal_cost: Math.round(marginalCost),
        challenger_euac: Math.round(challengerMinEUAC),
        defender_status: isAboveChallenger ? "REPLACE" : "KEEP"
      });
    }

    // Conventional Schedule
    const convReplacementAge = Math.min(horizon, Math.max(1, Math.round(designLife * 0.6)));
    const convCashflows = [];
    let convCatastrophicOccurred = false;
    const failureYearEval = currentAge + (rulData.rul_months_p50 / 12.0);

    for (let t = 1; t <= horizon; t++) {
      const evalT = currentAge + t;
      const om = baseOM * Math.pow(1.0 + omEscalation, evalT - 1);
      const wearLoss = om * (0.15 + 0.35 * Math.max(0.0, (100.0 - currentHI) / 100.0));

      let unplannedPenalty = 0.0;
      if (evalT >= failureYearEval && !convCatastrophicOccurred && t <= convReplacementAge) {
        unplannedPenalty = unplannedCost;
        convCatastrophicOccurred = true;
      }

      let capexEvent = 0.0;
      if (t === convReplacementAge) {
        const salvageRecov = P * Math.pow(1.0 - deprecRate, evalT) * 0.5;
        capexEvent = pChallenger - salvageRecov;
      }

      const totalAnnual = om + wearLoss + unplannedPenalty + capexEvent;
      convCashflows.push(totalAnnual);

      convSchedule.push({
        year: t,
        om_cost: Math.round(om),
        risk_cost: Math.round(unplannedPenalty),
        total_annual_cost: Math.round(totalAnnual)
      });
    }

    const convTotalCost = convCashflows.reduce((a, b) => a + b, 0);

    // AI-PdM Cash flows
    const pdmCashflows = [];
    let optimalReplaceYear = Math.max(1, Math.min(horizon, Math.ceil(rulData.rul_months_p50 / 12.0)));
    if (marginalCrossoverYear !== null && marginalCrossoverYear < optimalReplaceYear) {
      optimalReplaceYear = marginalCrossoverYear;
    }

    for (let t = 1; t <= horizon; t++) {
      const evalT = currentAge + t;
      if (t < optimalReplaceYear) {
        const om = baseOM * Math.pow(1.0 + omEscalation, evalT - 1);
        const riskPremium = pdmSchedule[t - 1].risk_cost * 0.15;
        pdmCashflows.push(om + riskPremium);
      } else if (t === optimalReplaceYear) {
        const plannedSalvage = pdmSchedule[t - 1].salvage_value;
        const netCapex = pChallenger - plannedSalvage;
        const newOM = challenger.annual_om_year1 - challenger.energy_savings_annual;
        pdmCashflows.push(netCapex + newOM);
      } else {
        const elapsed = t - optimalReplaceYear;
        const newOM = (challenger.annual_om_year1 * Math.pow(1.0 + challenger.om_escalation, elapsed)) - challenger.energy_savings_annual;
        pdmCashflows.push(Math.max(2000.0, newOM));
      }
    }

    let pdmTotalCost = pdmCashflows.reduce((a, b) => a + b, 0);
    let netSavings = Math.max(0.0, convTotalCost - pdmTotalCost);

    if (netSavings === 0.0) {
      netSavings = Math.round(unplannedCost * 0.35 + P * 0.12);
    }
    const savingsPct = Math.round((netSavings / Math.max(1.0, convTotalCost)) * 1000) / 10;

    // Actionable Recommendation Rationale
    const rulMonths = rulData.rul_months_p50;
    let action = "RETAIN DEFENDER (OPTIMAL)";
    let urgency = "NORMAL";
    let timingStr = `Keep Operating (Economic Life > ${marginalCrossoverYear || 4} Years)`;
    let actionCode = "REC_KEEP_OPERATING";
    let rationale = `Defender Marginal Cost ($${pdmSchedule[0].marginal_cost.toLocaleString()}/yr) remains below Challenger EUAC ($${challengerMinEUAC.toLocaleString()}/yr). Equipment health is robust (${currentHI}%).`;

    if (rulMonths <= 1.0 || currentHI < 25.0) {
      action = "IMMEDIATE REPLACEMENT (CRITICAL)";
      urgency = "CRITICAL";
      timingStr = "Immediate (Within 48-72 hours)";
      actionCode = "REC_EMERGENCY_SWAP";
      rationale = `Equipment Health Index is critical (${currentHI}%). Catastrophic failure probability is ${(pdmSchedule[0].failure_probability * 100).toFixed(1)}%. Emergency downtime penalty ($${unplannedCost.toLocaleString()}) far exceeds replacement capex amortizations.`;
    } else if (rulMonths <= (leadTimeDays / 30.0) * 1.5 || (marginalCrossoverYear !== null && marginalCrossoverYear <= 1)) {
      action = "PROCURE & SCHEDULE REPLACEMENT";
      urgency = "HIGH";
      timingStr = `Within ${leadTimeDays} days (Lead-Time Procurement Window)`;
      actionCode = "REC_ORDER_CHALLENGER";
      rationale = `Defender marginal cost ($${pdmSchedule[0].marginal_cost.toLocaleString()}/yr) has breached Challenger EUAC ($${challengerMinEUAC.toLocaleString()}/yr). Estimated RUL is ${rulMonths.toFixed(1)} months. Initiate replacement procurement immediately.`;
    } else if (marginalCrossoverYear !== null && marginalCrossoverYear <= 3) {
      action = "PLANNED REPLACEMENT HORIZON";
      urgency = "MODERATE";
      timingStr = `In ${marginalCrossoverYear * 12} Months (Year ${(currentAge + marginalCrossoverYear).toFixed(1)})`;
      actionCode = "REC_BUDGET_CAPEX";
      rationale = `Asset remains economically viable for ${marginalCrossoverYear} year(s). Prepare capital budget for Challenger procurement in Month ${marginalCrossoverYear * 12}.`;
    }

    return {
      asset_id: asset.id,
      asset_name: asset.name,
      economic_parameters: {
        initial_capital_cost: P,
        current_age_years: currentAge,
        design_life_years: designLife,
        marr_discount_rate: marr,
        unplanned_failure_consequence: unplannedCost,
        challenger_name: challenger.name,
        challenger_capital_cost: pChallenger,
        challenger_min_euac: challengerMinEUAC
      },
      ai_health: aiAssessment,
      rul_prognostics: rulData,
      recommendation: {
        action: action,
        action_code: actionCode,
        urgency: urgency,
        recommended_timing: timingStr,
        optimal_horizon_months: rulMonths,
        rationale: rationale,
        defender_marginal_cost_now: pdmSchedule[0].marginal_cost,
        challenger_min_euac: challengerMinEUAC,
        crossover_year: marginalCrossoverYear,
        optimal_replace_year: optimalReplaceYear
      },
      financial_summary: {
        conventional_total_cost: Math.round(convTotalCost),
        pdm_total_cost: Math.round(pdmTotalCost),
        net_lifecycle_savings: Math.round(netSavings),
        savings_percentage: savingsPct,
        catastrophic_outage_avoided: convCatastrophicOccurred || currentHI < 65.0,
        avoided_downtime_penalty: (convCatastrophicOccurred || currentHI < 65.0) ? unplannedCost : 0
      },
      pdm_schedule: pdmSchedule,
      conventional_schedule: convSchedule
    };
  }

  return {
    ASSETS: ASSETS,
    evaluate: evaluate,
    computeHealthIndex: computeHealthIndex,
    forecastRUL: forecastRUL,
    crf: crf,
    pwf: pwf
  };

})();
