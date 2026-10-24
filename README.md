# AI Asset Replacement Decision Support System
### Engineering Economics & Financial Management (EEFM) Mini Project

> **Problem Statement:** Conventional asset replacement analysis uses fixed depreciation schedules (e.g., straight-line, MACRS) and doesn't account for real-time equipment degradation, resulting in suboptimal replacement timing and increased lifecycle costs.
>
> **Solution:** A Replacement Decision Support Tool that uses sensor telemetry and stochastic failure data to recommend optimal replacement points against economic thresholds (EUAC and Marginal Cost Defender vs. Challenger analysis).

---

## 🚀 Quick Start Guide

### Option 1: Standalone Browser (Zero Installation / Instant Launch)
Simply open the web app directly in any modern browser (Chrome, Edge, Firefox, Brave):
- Double click or navigate to:
  ```
  file:///c:/Users/Nikhil/OneDrive/Desktop/EEFM/static/index.html
  ```
- The application contains an embedded, zero-latency client-side mathematical engine (`eefm_simulator.js`) and high-performance Canvas charts (`charts.js`) with full offline functionality.

### Option 2: Run the FastAPI High-Performance Server
Double-click the Windows batch script:
```bat
run_server.bat
```
Or run directly from PowerShell / Terminal:
```powershell
cd c:\Users\Nikhil\OneDrive\Desktop\EEFM
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser at: **`http://127.0.0.1:8000`**

---

## 🌟 Key Features

1. **Executive Decision Advisory:**
   - Real-time recommendation cards: `RETAIN DEFENDER (OPTIMAL)`, `PROCURE & SCHEDULE REPLACEMENT`, `PLANNED REPLACEMENT HORIZON`, or `IMMEDIATE REPLACEMENT (CRITICAL)`.
   - Precise replacement timing window with supplier procurement lead-time awareness.

2. **Condition-Based AI Prognostics:**
   - Multi-Sensor Health Index ($HI \in [1\%, 100\%]$) with exponential wear accumulation.
   - Remaining Useful Life (RUL) forecasting with P10, P50, and P90 confidence intervals.
   - Explainable AI (XAI) feature attribution breakdown showing root-cause sensor contributions.

3. **Engineering Economics & Financial Management (EEFM) Models:**
   - **Capital Recovery Cost with Return:** $\text{CR}(n) = (P - S_n)(A/P, i, n) + i \cdot S_n$.
   - **Condition-Adjusted Weibull Reliability & Failure Risk:** $\lambda(t \mid HI)$ and $C_{\text{risk}}(t)$.
   - **Equivalent Uniform Annual Cost (EUAC):** Component curves for Capital Recovery, O&M, and Risk.
   - **Marginal Cost Analysis:** Defender $MC_t$ evaluated against Challenger minimum EUAC ($EUAC^*_C$).

4. **Multi-Asset Industrial Archetypes:**
   - *High-Pressure Boiler Feedwater Pump (600 kW)*
   - *5-Axis High-Speed CNC Milling Spindle (24,000 RPM)*
   - *Aeroderivative Heavy-Duty Gas Turbine (32 MW)*
   - *Offshore Wind Turbine Planetary Gearbox (3.6 MW)*
   - *Main Step-Down Power Substation Transformer (50 MVA)*

5. **Interactive Telemetry & What-If Sandbox:**
   - Sliders for vibration, temperature, acoustic emissions, particle contamination, and electrical harmonics.
   - Quick-toggle scenarios: *Pristine Baseline*, *Incipient Wear*, *Severe Lubricant Breakdown*, *Emergency Runaway*.
   - Live telemetry stream simulation generator.
   - MARR (Discount Rate) and downtime consequence sensitivity sliders.

6. **Audit & Report Generation:**
   - One-click Executive Decision Report with printable PDF styling and JSON data download.

---

## 📁 Repository Structure

```
EEFM/
├── app.py                     # FastAPI application serving REST endpoints and UI
├── run_server.bat             # Windows one-click launcher
├── models/
│   ├── asset_data.py          # Industrial asset profiles, baseline sensors, and challenger specs
│   ├── pdm_ai_engine.py       # AI Health Index, RUL confidence bands, and Weibull reliability
│   └── eefm_engine.py         # EEFM models: Capital Recovery, EUAC, Marginal Cost, Life Cycle Cost
├── static/
│   ├── index.html             # Futuristic dark cyber-industrial UI cockpit
│   ├── css/
│   │   └── style.css          # Glassmorphism design system, responsive layout, animations
│   └── js/
│       ├── app.js             # UI controller, event bindings, and live streaming
│       ├── charts.js          # High-performance retina Canvas chart engine
│       └── eefm_simulator.js  # Offline client-side mathematical simulation engine
├── data/
│   └── sample_telemetry.json  # Pre-configured sensor degradation datasets
└── docs/
    └── PROJECT_REPORT.md      # Full academic project report with mathematical formulations
```

---

## 📐 Mathematical Formulation Summary

### 1. Capital Recovery Factor
$$(A/P, i, n) = \frac{i(1 + i)^n}{(1 + i)^n - 1}$$

### 2. Condition-Dependent Characteristic Life
$$\eta_{\text{cond}}(HI) = \eta_0 \cdot \left(\frac{HI}{100}\right)^{1.6}$$

### 3. Dynamic Failure Risk Cost
$$C_{\text{risk}}(t) = \left[ 1 - \exp\left( -\left(\frac{t}{\eta_{\text{cond}}(HI)}\right)^\beta \right) \right] \times C_{\text{unplanned\_consequence}}$$

### 4. Marginal Cost Replacement Trigger
$$MC_t = (S_{t-1} - S_t) + i \cdot S_{t-1} + O\&M_{\text{adj}}(t) + C_{\text{risk}}(t)$$
*Rule:* Replace Defender when $MC_t > \text{EUAC}^*_{\text{challenger}}$ or $RUL \le \text{Lead Time}$.
