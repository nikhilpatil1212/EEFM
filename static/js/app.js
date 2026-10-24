/**
 * Main Application Controller for AI Asset Replacement Decision Support System.
 * Coordinates UI events, real-time sensor updates, tab switching, and analytical recomputations.
 */

(function() {
  "use strict";

  // App State
  let state = {
    currentAssetId: "centrifugal_pump",
    currentTelemetry: {},
    marr: 0.10,
    unplannedFailureCost: null,
    degradationScenario: "actual",
    isStreaming: false,
    streamTimer: null,
    evaluationResult: null
  };

  // Pre-configured Scenarios
  const SCENARIOS = {
    healthy_nominal: {
      name: "Nominal Healthy Baseline",
      overrides: {
        centrifugal_pump: { vibration_rms: 2.3, bearing_temp: 63.5, acoustic_emission: 49.0, seal_leakage_flow: 1.6, oil_particle_ppm: 38.0 },
        cnc_spindle: { vibration_rms: 0.85, bearing_temp: 45.0, runout_microns: 1.9, motor_harmonic_thd: 2.2 },
        gas_turbine: { vibration_rms: 3.2, bearing_temp: 29.5, blade_strain_micro: 435.0, lube_ferrous_density: 8.5 },
        wind_gearbox: { vibration_rms: 1.3, bearing_temp: 56.0, oil_particle_ppm: 1250.0, acoustic_emission: 38.0 },
        substation_transformer: { dissolved_gas_c2h2: 0.45, bearing_temp: 66.0, moisture_in_oil: 12.5, furan_compounds: 0.18 }
      }
    },
    incipient_fault: {
      name: "Incipient Micro-Flaking",
      overrides: {
        centrifugal_pump: { vibration_rms: 4.2, bearing_temp: 78.0, acoustic_emission: 68.0, seal_leakage_flow: 5.2, oil_particle_ppm: 95.0 },
        cnc_spindle: { vibration_rms: 1.9, bearing_temp: 62.0, runout_microns: 5.4, motor_harmonic_thd: 4.8 },
        gas_turbine: { vibration_rms: 7.1, bearing_temp: 48.0, blade_strain_micro: 760.0, lube_ferrous_density: 28.0 },
        wind_gearbox: { vibration_rms: 3.2, bearing_temp: 74.0, oil_particle_ppm: 4200.0, acoustic_emission: 58.0 },
        substation_transformer: { dissolved_gas_c2h2: 3.2, bearing_temp: 88.0, moisture_in_oil: 24.0, furan_compounds: 0.95 }
      }
    },
    severe_wear: {
      name: "Severe Breakdown & Friction",
      overrides: {
        centrifugal_pump: { vibration_rms: 5.9, bearing_temp: 94.0, acoustic_emission: 82.0, seal_leakage_flow: 12.5, oil_particle_ppm: 195.0 },
        cnc_spindle: { vibration_rms: 3.6, bearing_temp: 78.5, runout_microns: 9.8, motor_harmonic_thd: 8.4 },
        gas_turbine: { vibration_rms: 12.4, bearing_temp: 82.0, blade_strain_micro: 1180.0, lube_ferrous_density: 62.0 },
        wind_gearbox: { vibration_rms: 6.1, bearing_temp: 93.0, oil_particle_ppm: 9800.0, acoustic_emission: 76.0 },
        substation_transformer: { dissolved_gas_c2h2: 11.2, bearing_temp: 110.0, moisture_in_oil: 38.0, furan_compounds: 2.8 }
      }
    },
    critical_emergency: {
      name: "Emergency Runaway Fault",
      overrides: {
        centrifugal_pump: { vibration_rms: 8.4, bearing_temp: 112.0, acoustic_emission: 95.0, seal_leakage_flow: 22.0, oil_particle_ppm: 310.0 },
        cnc_spindle: { vibration_rms: 5.8, bearing_temp: 92.0, runout_microns: 16.5, motor_harmonic_thd: 14.2 },
        gas_turbine: { vibration_rms: 18.2, bearing_temp: 108.0, blade_strain_micro: 1650.0, lube_ferrous_density: 105.0 },
        wind_gearbox: { vibration_rms: 8.9, bearing_temp: 111.0, oil_particle_ppm: 16500.0, acoustic_emission: 92.0 },
        substation_transformer: { dissolved_gas_c2h2: 22.5, bearing_temp: 132.0, moisture_in_oil: 54.0, furan_compounds: 4.6 }
      }
    }
  };

  // DOM Elements Cache
  const elements = {};

  function init() {
    cacheDOMElements();
    bindEvents();
    loadAsset(state.currentAssetId);
  }

  function cacheDOMElements() {
    elements.assetSelect = document.getElementById("asset-select");
    elements.scenarioChips = document.querySelectorAll(".scenario-chips .chip-btn");
    elements.tabButtons = document.querySelectorAll(".tab-btn");
    elements.tabPanes = document.querySelectorAll(".tab-pane");

    // Decision Hero
    elements.recommendationCard = document.getElementById("recommendation-card");
    elements.decisionUrgencyBadge = document.getElementById("decision-urgency-badge");
    elements.decisionActionTitle = document.getElementById("decision-action-title");
    elements.decisionTimeline = document.getElementById("decision-timeline");
    elements.decisionRationale = document.getElementById("decision-rationale");

    // Health Dial
    elements.hiNumber = document.getElementById("hi-number");
    elements.meterValCircle = document.getElementById("meter-val-circle");
    elements.hiStatusTitle = document.getElementById("hi-status-title");
    elements.hiSeverityDesc = document.getElementById("hi-severity-desc");

    // KPIs
    elements.kpiRul = document.getElementById("kpi-rul");
    elements.kpiDefenderMarginal = document.getElementById("kpi-defender-marginal");
    elements.kpiChallengerEuac = document.getElementById("kpi-challenger-euac");
    elements.kpiSavings = document.getElementById("kpi-savings");
    elements.kpiSavingsPct = document.getElementById("kpi-savings-pct");

    // Telemetry Gauges Container
    elements.sensorGaugesContainer = document.getElementById("sensor-gauges-container");
    elements.attributionList = document.getElementById("attribution-list");

    // Table
    elements.eefmTableBody = document.getElementById("eefm-table-body");

    // Sensitivity Sliders
    elements.marrSlider = document.getElementById("marr-slider");
    elements.marrReadout = document.getElementById("marr-readout");
    elements.failureCostSlider = document.getElementById("failure-cost-slider");
    elements.failureCostReadout = document.getElementById("failure-cost-readout");
    elements.dutySelect = document.getElementById("duty-select");

    // Stream Controls
    elements.btnStreamToggle = document.getElementById("btn-stream-toggle");

    // Modals
    elements.btnOpenMath = document.getElementById("btn-open-math");
    elements.modalMath = document.getElementById("modal-math");
    elements.btnCloseMath = document.getElementById("btn-close-math");

    elements.btnExportReport = document.getElementById("btn-export-report");
    elements.modalReport = document.getElementById("modal-report");
    elements.btnCloseReport = document.getElementById("btn-close-report");
    elements.reportContent = document.getElementById("report-content");
    elements.btnPrintReport = document.getElementById("btn-print-report");
    elements.btnDownloadJson = document.getElementById("btn-download-json");
  }

  function bindEvents() {
    // Asset change
    elements.assetSelect.addEventListener("change", (e) => {
      loadAsset(e.target.value);
    });

    // Scenario chips
    elements.scenarioChips.forEach(btn => {
      btn.addEventListener("click", () => {
        elements.scenarioChips.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyScenario(btn.dataset.scenario);
      });
    });

    // Tabs
    elements.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        elements.tabButtons.forEach(b => b.classList.remove("active"));
        elements.tabPanes.forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.dataset.tab;
        document.getElementById(targetId).classList.add("active");
        renderAllCharts();
      });
    });

    // Sensitivity inputs
    elements.marrSlider.addEventListener("input", (e) => {
      state.marr = parseFloat(e.target.value) / 100.0;
      elements.marrReadout.textContent = `${e.target.value}%`;
      recalculate();
    });

    elements.failureCostSlider.addEventListener("input", (e) => {
      state.unplannedFailureCost = parseFloat(e.target.value);
      elements.failureCostReadout.textContent = `$${parseInt(e.target.value).toLocaleString()}`;
      recalculate();
    });

    elements.dutySelect.addEventListener("change", (e) => {
      state.degradationScenario = e.target.value;
      recalculate();
    });

    // Stream toggle
    elements.btnStreamToggle.addEventListener("click", toggleLiveStream);

    // Math Modal
    elements.btnOpenMath.addEventListener("click", () => elements.modalMath.classList.add("open"));
    elements.btnCloseMath.addEventListener("click", () => elements.modalMath.classList.remove("open"));

    // Report Modal
    elements.btnExportReport.addEventListener("click", openReportModal);
    elements.btnCloseReport.addEventListener("click", () => elements.modalReport.classList.remove("open"));
    elements.btnPrintReport.addEventListener("click", () => window.print());
    elements.btnDownloadJson.addEventListener("click", downloadJsonReport);

    // Window resize
    window.addEventListener("resize", () => {
      renderAllCharts();
    });
  }

  function loadAsset(assetId) {
    state.currentAssetId = assetId;
    const asset = EEFMSimulator.ASSETS[assetId];
    if (!asset) return;

    // Reset failure cost slider range to match asset scale
    const baseUnplanned = asset.unplanned_failure_cost;
    elements.failureCostSlider.min = Math.round(baseUnplanned * 0.2);
    elements.failureCostSlider.max = Math.round(baseUnplanned * 2.5);
    elements.failureCostSlider.step = Math.round(baseUnplanned * 0.05);
    elements.failureCostSlider.value = baseUnplanned;
    elements.failureCostReadout.textContent = `$${Math.round(baseUnplanned).toLocaleString()}`;
    state.unplannedFailureCost = baseUnplanned;

    // Set baseline telemetry
    state.currentTelemetry = {};
    for (const [key, spec] of Object.entries(asset.sensors)) {
      state.currentTelemetry[key] = spec.baseline;
    }

    // Default to active scenario if any
    const activeChip = document.querySelector(".scenario-chips .chip-btn.active");
    if (activeChip && SCENARIOS[activeChip.dataset.scenario]) {
      applyScenario(activeChip.dataset.scenario, false);
    }

    buildSensorGaugesUI(asset);
    recalculate();
  }

  function applyScenario(scenarioId, triggerRecalc = true) {
    const sc = SCENARIOS[scenarioId];
    if (!sc) return;
    const overrides = sc.overrides[state.currentAssetId];
    if (!overrides) return;

    state.currentTelemetry = { ...overrides };
    updateSensorGaugesSliders();
    if (triggerRecalc) recalculate();
  }

  function buildSensorGaugesUI(asset) {
    elements.sensorGaugesContainer.innerHTML = "";

    for (const [key, spec] of Object.entries(asset.sensors)) {
      const val = state.currentTelemetry[key] !== undefined ? state.currentTelemetry[key] : spec.baseline;

      const card = document.createElement("div");
      card.className = "sensor-gauge-item";
      card.id = `sensor-card-${key}`;

      // Min and max for slider
      const minVal = Math.round(spec.baseline * 0.5 * 10) / 10;
      const maxVal = Math.round(spec.critical * 1.5 * 10) / 10;
      const stepVal = Math.round(((maxVal - minVal) / 80) * 100) / 100 || 0.1;

      card.innerHTML = `
        <div class="sensor-name-row">
          <span class="sensor-name">${spec.name}</span>
          <span class="sensor-category">${spec.category}</span>
        </div>
        <div class="sensor-reading-row">
          <span class="sensor-value-live" id="val-${key}">${val}</span>
          <span class="sensor-unit">${spec.unit}</span>
        </div>
        <div class="slider-container">
          <input type="range" class="sensor-slider" id="slider-${key}" min="${minVal}" max="${maxVal}" step="${stepVal}" value="${val}">
          <div class="sensor-threshold-scale">
            <span>Base: ${spec.baseline}</span>
            <span style="color: var(--amber-warning)">Warn: ${spec.warning}</span>
            <span style="color: var(--rose-danger)">Crit: ${spec.critical}</span>
          </div>
        </div>
      `;

      elements.sensorGaugesContainer.appendChild(card);

      // Bind slider input
      const slider = card.querySelector(`#slider-${key}`);
      slider.addEventListener("input", (e) => {
        const num = parseFloat(e.target.value);
        state.currentTelemetry[key] = num;
        card.querySelector(`#val-${key}`).textContent = num;
        recalculate();
      });
    }
  }

  function updateSensorGaugesSliders() {
    for (const [key, val] of Object.entries(state.currentTelemetry)) {
      const valEl = document.getElementById(`val-${key}`);
      const sliderEl = document.getElementById(`slider-${key}`);
      if (valEl) valEl.textContent = val;
      if (sliderEl) sliderEl.value = val;
    }
  }

  function recalculate() {
    // Perform mathematical evaluation via EEFMSimulator
    const res = EEFMSimulator.evaluate(
      state.currentAssetId,
      state.currentTelemetry,
      state.marr,
      state.unplannedFailureCost,
      state.degradationScenario
    );

    state.evaluationResult = res;
    updateHeroUI(res);
    updateTableUI(res);
    updateAttributionsUI(res.ai_health.feature_attributions);
    renderAllCharts();
  }

  function updateHeroUI(res) {
    const rec = res.recommendation;
    const ai = res.ai_health;
    const fin = res.financial_summary;
    const rul = res.rul_prognostics;

    // Recommendation card styling
    elements.recommendationCard.className = `recommendation-card glass-panel ${rec.urgency.toLowerCase()}`;
    elements.decisionUrgencyBadge.textContent = rec.urgency;
    elements.decisionActionTitle.textContent = rec.action;
    elements.decisionTimeline.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      Target Horizon: ${rec.recommended_timing}
    `;
    elements.decisionRationale.textContent = rec.rationale;

    // Health Dial
    elements.hiNumber.textContent = ai.health_index;
    elements.hiNumber.style.color = ai.status_color;
    elements.hiStatusTitle.textContent = ai.status.replace(/_/g, " ");
    elements.hiStatusTitle.style.color = ai.status_color;
    elements.hiSeverityDesc.textContent = ai.severity_desc;

    // Circle stroke-dashoffset (circumference = 2 * PI * 60 = 377)
    const circum = 377;
    const offset = circum - (ai.health_index / 100.0) * circum;
    elements.meterValCircle.style.strokeDashoffset = offset;
    elements.meterValCircle.style.stroke = ai.status_color;

    // KPIs
    elements.kpiRul.textContent = `${rul.rul_months_p50} mo`;
    elements.kpiDefenderMarginal.textContent = `$${rec.defender_marginal_cost_now.toLocaleString()}`;
    elements.kpiChallengerEuac.textContent = `$${rec.challenger_min_euac.toLocaleString()}`;
    elements.kpiSavings.textContent = `$${fin.net_lifecycle_savings.toLocaleString()}`;
    elements.kpiSavingsPct.textContent = `${fin.savings_percentage}% LCC reduction`;
  }

  function updateTableUI(res) {
    const tbody = elements.eefmTableBody;
    tbody.innerHTML = "";

    const schedule = res.pdm_schedule;
    const crossover = res.recommendation.crossover_year;

    schedule.forEach(row => {
      const tr = document.createElement("tr");
      if (row.keep_years === crossover) {
        tr.className = "highlight-replace-row";
      }

      tr.innerHTML = `
        <td><strong>Yr ${row.keep_years}</strong> (${row.projected_age} yrs)</td>
        <td><span style="color:${row.health_index < 30 ? 'var(--rose-danger)' : row.health_index < 60 ? 'var(--amber-warning)' : 'var(--cyan-primary)'}">${row.health_index}%</span></td>
        <td>${(row.failure_probability * 100).toFixed(1)}%</td>
        <td>$${row.salvage_value.toLocaleString()}</td>
        <td>$${row.capital_recovery_cr.toLocaleString()}</td>
        <td>$${row.om_cost.toLocaleString()}</td>
        <td><span style="color:var(--rose-danger)">$${row.risk_cost.toLocaleString()}</span></td>
        <td><strong>$${row.total_euac.toLocaleString()}</strong></td>
        <td><span style="color:${row.marginal_cost > row.challenger_euac ? 'var(--rose-danger)' : 'var(--cyan-primary)'}; font-weight:700">$${row.marginal_cost.toLocaleString()}</span></td>
        <td>
          <span class="status-badge-inline ${row.defender_status === 'REPLACE' ? 'replace' : 'keep'}">
            ${row.defender_status}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function updateAttributionsUI(attributions) {
    elements.attributionList.innerHTML = "";
    const sorted = Object.values(attributions).sort((a, b) => b.contribution_pct - a.contribution_pct);

    sorted.forEach(attr => {
      const item = document.createElement("div");
      item.className = "attribution-bar-item";

      item.innerHTML = `
        <div class="attribution-header">
          <span>${attr.name} (${attr.current_value} ${attr.unit})</span>
          <span style="font-weight:700; color:var(--cyan-primary)">${attr.contribution_pct}% Stress</span>
        </div>
        <div class="attribution-bar-track">
          <div class="attribution-bar-fill" style="width: ${Math.min(100, Math.max(5, attr.contribution_pct))}%;"></div>
        </div>
      `;
      elements.attributionList.appendChild(item);
    });
  }

  function renderAllCharts() {
    if (!state.evaluationResult) return;
    const res = state.evaluationResult;

    // 1. EUAC Chart
    EEFMCharts.renderEUACChart("canvas-euac", res.pdm_schedule, res.recommendation.crossover_year);

    // 2. Marginal Cost vs Challenger Chart
    EEFMCharts.renderMarginalCostChart(
      "canvas-marginal",
      res.pdm_schedule,
      res.economic_parameters.challenger_min_euac,
      res.recommendation.crossover_year
    );

    // 3. RUL Degradation Trajectory Chart
    EEFMCharts.renderRULTrajectoryChart("canvas-rul", res.rul_prognostics.forecast_trajectory, 20.0);

    // 4. Cash Flow Comparison Chart
    EEFMCharts.renderCashflowComparisonChart("canvas-cashflow", res.conventional_schedule, res.pdm_schedule);
  }

  // Live Telemetry Streaming Simulation
  function toggleLiveStream() {
    if (state.isStreaming) {
      clearInterval(state.streamTimer);
      state.isStreaming = false;
      elements.btnStreamToggle.textContent = "Start Live Stream";
      elements.btnStreamToggle.classList.remove("btn-primary");
      elements.btnStreamToggle.classList.add("btn-secondary");
    } else {
      state.isStreaming = true;
      elements.btnStreamToggle.textContent = "Stop Stream (Live)";
      elements.btnStreamToggle.classList.remove("btn-secondary");
      elements.btnStreamToggle.classList.add("btn-primary");

      state.streamTimer = setInterval(() => {
        const asset = EEFMSimulator.ASSETS[state.currentAssetId];
        for (const [key, spec] of Object.entries(asset.sensors)) {
          const current = state.currentTelemetry[key];
          // Small synthetic Gaussian fluctuation
          const delta = (Math.random() - 0.48) * (spec.warning - spec.baseline) * 0.05;
          const next = Math.max(spec.baseline * 0.6, Math.min(spec.critical * 1.4, current + delta));
          state.currentTelemetry[key] = Math.round(next * 100) / 100;
        }
        updateSensorGaugesSliders();
        recalculate();
      }, 900);
    }
  }

  // Report Generation
  function openReportModal() {
    const res = state.evaluationResult;
    if (!res) return;

    elements.reportContent.innerHTML = `
      <div style="padding: 10px 0; border-bottom: 1px solid var(--border-subtle); margin-bottom: 20px;">
        <h2 style="font-family: var(--font-heading); color: #fff;">Asset Replacement Decision Audit Report</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Generated by AI-Driven PdM Decision Support System &bull; EEFM Framework</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Evaluated Asset (Defender)</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${res.asset_name}</div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
            Current Age: ${res.economic_parameters.current_age_years} yrs &bull; Design Life: ${res.economic_parameters.design_life_years} yrs &bull; Initial Cost: $${res.economic_parameters.initial_capital_cost.toLocaleString()}
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Replacement Candidate (Challenger)</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${res.economic_parameters.challenger_name}</div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
            Capex: $${res.economic_parameters.challenger_capital_cost.toLocaleString()} &bull; Min EUAC: $${res.economic_parameters.challenger_min_euac.toLocaleString()}/yr
          </div>
        </div>
      </div>

      <div style="background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.3); padding: 18px; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--cyan-primary);">Executive Advisory Decision</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin: 4px 0;">${res.recommendation.action}</div>
        <div style="font-size: 0.95rem; font-weight: 600; color: var(--cyan-primary); margin-bottom: 8px;">Recommended Timing: ${res.recommendation.recommended_timing}</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">${res.recommendation.rationale}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 6px;">
          <div style="font-size: 0.7rem; color: var(--text-dim);">Equipment Health</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: ${res.ai_health.status_color};">${res.ai_health.health_index}%</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 6px;">
          <div style="font-size: 0.7rem; color: var(--text-dim);">RUL Horizon</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: #fff;">${res.rul_prognostics.rul_months_p50} mo</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 6px;">
          <div style="font-size: 0.7rem; color: var(--text-dim);">Net Lifecycle Savings</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--emerald-success);">$${res.financial_summary.net_lifecycle_savings.toLocaleString()}</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 6px;">
          <div style="font-size: 0.7rem; color: var(--text-dim);">LCC Savings Ratio</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--cyan-primary);">${res.financial_summary.savings_percentage}%</div>
        </div>
      </div>
    `;

    elements.modalReport.classList.add("open");
  }

  function downloadJsonReport() {
    if (!state.evaluationResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.evaluationResult, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `EEFM_Asset_Replacement_${state.currentAssetId}_report.json`);
    dlAnchor.click();
  }

  // Self Initialization on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
