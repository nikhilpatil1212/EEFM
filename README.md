# AI-Driven Asset Replacement Decision Support System
### Engineering Economics & Financial Management (EEFM) Framework

> **Problem Statement:** Conventional asset replacement analysis relies on predetermined calendar-based depreciation schedules (Straight-Line, MACRS, or geometric decay) and deterministic O&M escalation. This decouples capital allocation from real physical degradation, resulting in either premature replacement of healthy equipment or delayed replacement that triggers catastrophic breakdown, severe downtime penalties ($10,000 to $150,000+/hr), and safety hazards.
>
> **Solution:** A unified Engineering Economics & Predictive Maintenance (PdM) Decision Support System that ingests multi-sensor SCADA telemetry to compute a real-time AI Health Index, dynamic Weibull failure probabilities, condition-adjusted salvage values, and stochastic failure risk costs. By evaluating the dynamic **Equivalent Uniform Annual Cost (EUAC)** and **Marginal Cost ($MC_t$)** of retaining the existing asset (**Defender**) against state-of-the-art technological alternatives (**Challenger**), the system issues actionable, lead-time-aware capital expenditure advisories.

---

## 🚀 Quick Start Guide

### Option 1: Standalone Browser Launch (Zero Installation)
The entire analytical simulation engine and retina visualizer are compiled into self-contained client-side JavaScript.
- Simply double-click or open in any modern browser (Chrome, Edge, Firefox, Brave):
  ```
  file:///c:/Users/Nikhil/OneDrive/Desktop/EEFM/static/index.html
  ```
- Instant zero-latency execution, full interactive controls, and offline capability.

### Option 2: High-Performance FastAPI Application Server
Run the production Python backend via the automated batch script:
```bat
run_server.bat
```
Or launch directly from terminal / PowerShell:
```powershell
cd c:\Users\Nikhil\OneDrive\Desktop\EEFM
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Navigate to: **`http://127.0.0.1:8000`**

---

## 📁 Repository Structure

```
EEFM/
├── app.py                     # High-performance FastAPI REST API and static server
├── run_server.bat             # Windows one-click production launcher
├── build_bundle.py            # Standalone bundling script for zero-install distribution
├── models/
│   ├── asset_data.py          # Industrial asset profiles, baseline sensors, and challenger specs
│   ├── pdm_ai_engine.py       # AI Health Index, RUL confidence bands, and Weibull reliability
│   └── eefm_engine.py         # EEFM models: Capital Recovery, EUAC, Marginal Cost, Life Cycle Cost
├── static/
│   ├── index.html             # Industrial Editorial & Financial Intelligence UI Cockpit
│   ├── css/
│   │   └── style.css          # Editorial typography, CSS tokens, dark mode, responsive layout
│   └── js/
│       ├── app.js             # State manager, event dispatcher, REST client, live SCADA streamer
│       ├── charts.js          # Retina 2D Canvas analytical chart engine
│       └── eefm_simulator.js  # Client-side mirror of EEFM & PdM mathematical engines
├── data/
│   └── sample_telemetry.json  # Pre-configured sensor degradation benchmark datasets
└── docs/
    └── PROJECT_REPORT.md      # Academic project report and financial proofs
```

---

## 📐 Mathematical & Engineering Economic Formulations

The system models the equipment replacement problem by integrating physical sensor degradation into classic Discounted Cash Flow (DCF) and Capital Recovery economics under a Minimum Attractive Rate of Return (MARR, $i$).

```
                                 ┌──────────────────────────────────────────────┐
                                 │       Real-Time Sensor Telemetry x_j(t)      │
                                 └──────────────────────┬───────────────────────┘
                                                        │
                                                        ▼
                                 ┌──────────────────────────────────────────────┐
                                 │     Multi-Sensor AI Health Index HI(t)       │
                                 └──────────────┬────────────────┬──────────────┘
                                                │                │
                        ┌───────────────────────┘                └────────────────────────┐
                        ▼                                                                 ▼
      ┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
      │   Condition-Dependent Weibull     │                             │    Condition-Adjusted Salvage     │
      │   Characteristic Life η(HI)       │                             │         and O&M Escalation        │
      └─────────────────┬─────────────────┘                             └─────────────────┬─────────────────┘
                        │                                                                 │
                        ▼                                                                 ▼
      ┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
      │   Stochastic Failure Probability  │                             │     Annualized Capital Recovery   │
      │   F(t | HI) & Risk Cost C_risk(t) │                             │       CR(n) and O&M Cost EUAC     │
      └─────────────────┬─────────────────┘                             └─────────────────┬─────────────────┘
                        │                                                                 │
                        └───────────────────────┐                ┌────────────────────────┘
                                                ▼                ▼
                                 ┌──────────────────────────────────────────────┐
                                 │      Total Condition-Adjusted EUAC(n)        │
                                 │      Defender Marginal Cost MC_t             │
                                 └──────────────────────┬───────────────────────┘
                                                        │
                                                        ▼
                                 ┌──────────────────────────────────────────────┐
                                 │   Decision Boundary vs. Challenger EUAC*     │
                                 └──────────────────────────────────────────────┘
```

### 1. Fundamental Interest & Amortization Factors
For a real discount rate $i$ over $n$ compounding years:
* **Capital Recovery Factor $(A/P, i, n)$:** Converts Present Capital $P$ into an equivalent uniform annual series $A$:
  $$(A/P, i, n) = \frac{i(1 + i)^n}{(1 + i)^n - 1}$$
* **Sinking Fund Factor $(A/F, i, n)$:** Converts Future Worth $F$ into an equivalent uniform annual series $A$:
  $$(A/F, i, n) = \frac{i}{(1 + i)^n - 1}$$
* **Present Worth Factor $(P/F, i, t)$:** Discounts a single future cash flow at year $t$ to Present Value:
  $$(P/F, i, t) = (1 + i)^{-t}$$

### 2. Capital Recovery Cost with Return ($CR$)
The annualized capital recovery cost of purchasing an asset at market price $P$ and recovering salvage value $S_n$ at end of life $n$:
$$CR(n) = (P - S_n)(A/P, i, n) + i \cdot S_n = P(A/P, i, n) - S_n(A/F, i, n)$$
* Where $(P - S_n)(A/P, i, n)$ accounts for capital depreciation recovery.
* $i \cdot S_n$ represents the opportunity cost of capital tied up in the terminal salvage value.

### 3. Asset Salvage Value & Depreciation Modeling
Conventional analysis uses a fixed geometric book decay rate $d = 1 - (s_{\text{nominal}})^{1/N_{\text{design}}}$:
$$S_{\text{book}}(t) = P \cdot (1 - d)^t$$
In the AI-driven framework, real market salvage value is penalized if internal component damage has developed:
$$S(t) = \max\left( 0.04 \cdot P, \;\; S_{\text{book}}(t) \cdot \left[ 0.25 + 0.75 \cdot \left(\frac{HI(t)}{100}\right)^{1.3} \right] \right)$$
* When $HI = 100\%$ (pristine), the asset recovers 100% of book salvage.
* When $HI \to 0\%$ (destroyed/seized), salvage collapses to baseline scrap metal value ($4\%$ of initial capital).

### 4. Condition-Adjusted Operating & Maintenance Cost Escalation
Baseline operating expenses escalate with inflation and routine wear at rate $r_{\text{om}}$. However, mechanical degradation introduces excess parasitic friction, fluid leakage, and severe vibration wear:
$$O\&M_{\text{adj}}(t) = O\&M_{\text{base}} \cdot (1 + r_{\text{om}})^{t - 1} \cdot \left[ 1 + 2.5 \cdot \left(\frac{100 - HI(t)}{100}\right)^{2.2} \right]$$
* At $HI = 100\%$, the multiplier is $1.0\times$ (nominal baseline).
* At $HI = 50\%$, the multiplier increases to $1.54\times$.
* At $HI = 20\%$ (critical), maintenance requirements escalate by up to $3.5\times$ due to emergency component repairs.

### 5. Condition-Dependent Weibull Hazard & Failure Probability
Equipment wear-out adheres to a two-parameter Weibull distribution operating in the wear-out regime ($\beta = 2.8 > 1$). 
The **characteristic life** $\eta$ (time to $63.2\%$ cumulative failure probability) is dynamically scaled by the AI Health Index:
$$\eta_{\text{cond}}(HI) = \max\left( 0.5, \;\; \eta_0 \cdot \left(\frac{HI(t)}{100}\right)^{1.6} \right)$$
Where $\eta_0 = N_{\text{design}}$. The cumulative failure probability $F(t \mid HI)$ is:
$$F(t \mid HI) = 1 - \exp\left( -\left[ \frac{t}{\eta_{\text{cond}}(HI)} \right]^\beta \right)$$

### 6. Dynamic Unplanned Outage Risk Cost ($C_{\text{risk}}$)
In process manufacturing and power generation, an unpredicted catastrophic failure incurs emergency labor premiums, collateral machinery damage, and unrecoverable downtime losses:
$$C_{\text{risk}}(t) = F(t \mid HI) \times C_{\text{unplanned\_consequence}}$$
* In conventional economic replacement, $C_{\text{risk}}$ is ignored ($0$), causing plants to hold assets past their safe economic limit.
* In the AI model, as $HI$ deteriorates, $C_{\text{risk}}(t)$ escalates exponentially, driving the economic decision toward proactive replacement.

### 7. Total Equivalent Uniform Annual Cost (EUAC)
For an evaluation horizon of $n$ periods, the annualized total cost of operating the Defender combines Capital Recovery, Present Worth of O&M, and Present Worth of Stochastic Failure Risk:
$$\text{EUAC}(n) = CR(n) + \text{EUAC}_{O\&M}(n) + \text{EUAC}_{\text{risk}}(n)$$
$$\text{EUAC}(n) = (P - S_n)(A/P, i, n) + i \cdot S_n + \left[ \sum_{t=1}^n \frac{O\&M_{\text{adj}}(t) + C_{\text{risk}}(t)}{(1 + i)^t} \right] (A/P, i, n)$$

### 8. Defender Marginal Cost ($MC_t$) Formulation
The marginal cost of retaining the existing machine (**Defender**) for one additional year from year $t-1$ to year $t$ equals:
$$MC_t = \underbrace{(S_{t-1} - S_t)}_{\text{Depreciation Loss}} + \underbrace{i \cdot S_{t-1}}_{\text{Foregone Interest on Capital}} + \underbrace{O\&M_{\text{adj}}(t)}_{\text{Operating Cost}} + \underbrace{C_{\text{risk}}(t)}_{\text{Stochastic Outage Risk}}$$
* **Depreciation Loss:** The drop in market asset value over the year.
* **Foregone Interest:** Return on capital if the machine had been liquidated at $t-1$ and invested at MARR $i$.
* **O&M Cost:** Direct operational, lubricant, energy, and maintenance expenses.
* **Stochastic Outage Risk:** Expected failure cost under real-time physical condition.

### 9. Defender vs. Challenger Economic Decision Boundary
The **Challenger** represents the optimal replacement technology available on the market with a known minimum Equivalent Uniform Annual Cost $\text{EUAC}^*_{\text{challenger}}$ and economic life $n^*_C$:
$$\text{EUAC}^*_{\text{challenger}} = \min_{n} \text{EUAC}_{\text{challenger}}(n)$$

#### Decision Rules:
1. **RETAIN DEFENDER (OPTIMAL):**
   $$MC_t \le \text{EUAC}^*_{\text{challenger}} \quad \text{AND} \quad RUL > 1.5 \times \text{Lead Time} \quad \text{AND} \quad HI \ge 50\%$$
   *Action:* Retaining the Defender minimizes annual operating expenditure. Continue routine PdM monitoring.
2. **PLANNED REPLACEMENT HORIZON:**
   $$MC_t \le \text{EUAC}^*_{\text{challenger}} \quad \text{but crossover occurs within } 12 \text{ to } 36 \text{ months}$$
   *Action:* Capital allocation stage. Earmark CapEx budget for future procurement.
3. **PROCURE & SCHEDULE REPLACEMENT:**
   $$MC_t > \text{EUAC}^*_{\text{challenger}} \quad \text{OR} \quad RUL \le 1.5 \times \text{Lead Time}$$
   *Action:* Defender marginal cost exceeds the annualized cost of the Challenger. Trigger procurement requisition immediately to accommodate supplier lead times.
4. **IMMEDIATE REPLACEMENT (CRITICAL):**
   $$HI < 25\% \quad \text{OR} \quad RUL \le 1.0 \text{ month}$$
   *Action:* Emergency state. Failure hazard exceeds acceptable safety thresholds. Isolate equipment and initiate emergency swap.

### 10. Remaining Useful Life (RUL) Prognostics
RUL is formulated as a non-linear decay trajectory to the critical failure threshold ($HI_{\text{failure}} = 20.0\%$):
* **Base Decay Parameter:** $\lambda_{\text{base}} = \frac{-\ln(0.20)}{N_{\text{design}}} = \frac{1.6094}{N_{\text{design}}}$
* **Wear Acceleration Factor:** $\alpha_{\text{wear}} = \max\left( 0.6, \;\; \frac{100 - HI(t)}{100 - 100 \exp(-\lambda_{\text{base}} \cdot t_{\text{age}})} \right)$
* **Effective Decay Rate:** $\lambda_{\text{eff}} = \lambda_{\text{base}} \cdot \alpha_{\text{wear}} \cdot k_{\text{duty}}$
* **Expected RUL (P50, Months):**
  $$RUL_{\text{months, P50}} = \max\left( 0.2, \;\; \frac{\ln(HI(t) / 20.0)}{\lambda_{\text{eff}}} \times 12 \right)$$
* **Log-Normal Dispersion Cone (P10 / P90 Confidence Intervals):**
  $$\sigma_{\text{volatility}} = 0.22 \sqrt{\max(0.5, RUL_{\text{years, P50}})}$$
  $$RUL_{\text{months, P10}} = RUL_{\text{months, P50}} \cdot \exp(-1.28 \cdot \sigma_{\text{volatility}})$$
  $$RUL_{\text{months, P90}} = RUL_{\text{months, P50}} \cdot \exp(+1.28 \cdot \sigma_{\text{volatility}})$$

---

## 🧠 Machine Learning & Predictive Maintenance (PdM) Architecture

The PdM pipeline operates as a physics-informed surrogate model bridging raw sensor telemetry to economic variables:

```
[SCADA Sensors] ──> [Piecewise Stress] ──> [Weighted Penalty] ──> [Exp Decay HI] ──> [XAI Attribution]
                                                                          │
                                         ┌────────────────────────────────┘
                                         ▼
                 [Weibull η(HI) Contraction] ──> [RUL Confidence Cone (P10/P50/P90)]
```

### 1. Physics-Informed Piecewise Stress Normalization
Raw telemetry $x_j$ for sensor $j$ is normalized against engineering baseline ($x_{j,\text{base}}$), warning ($x_{j,\text{warn}}$), and critical danger limit ($x_{j,\text{crit}}$):
$$\text{Stress}_j(t) = \begin{cases} 
0.0, & x_j \le x_{j,\text{base}} \\
0.4 \left(\frac{x_j - x_{j,\text{base}}}{x_{j,\text{warn}} - x_{j,\text{base}}}\right), & x_{j,\text{base}} < x_j \le x_{j,\text{warn}} \\
0.4 + 0.6 \left(\frac{x_j - x_{j,\text{warn}}}{x_{j,\text{crit}} - x_{j,\text{warn}}}\right), & x_{j,\text{warn}} < x_j \le x_{j,\text{crit}} \\
1.0 + 0.5 \left(\frac{x_j - x_{j,\text{crit}}}{x_{j,\text{crit}} - x_{j,\text{warn}}}\right), & x_j > x_{j,\text{crit}} 
\end{cases}$$

### 2. Multi-Sensor Damage Accumulator ($HI$)
Physical damage accumulates non-linearly due to mechanical fatigue, thermal degradation, and fluid cavitation:
$$\text{Total Damage Penalty } \Phi = \sum_{j=1}^m w_j \cdot [\text{Stress}_j(t)]^{1.85}, \quad \text{where } \sum_{j=1}^m w_j = 1.0$$
$$HI(t) = 100 \cdot \exp(-1.45 \cdot \Phi), \quad HI(t) \in [1\%, 100\%]$$

### 3. Explainable AI (XAI) Stress Attribution
To empower plant maintenance engineers to identify root causes, feature attribution is calculated for each sensor:
$$\text{Attribution}_j = \frac{w_j \cdot [\text{Stress}_j(t)]^{1.85}}{\Phi} \times 100\%$$
This isolates whether degradation is driven by rotor imbalance, cavitation, thermal breakdown, or lubrication contamination.

### 4. Health States & Severity Taxonomy

| Health Index Range | Degradation State | Visual Indicator | Operational Interpretation |
| :--- | :--- | :--- | :--- |
| **85.0% - 100.0%** | `HEALTHY` | Deep Green (`#387653`) | Optimal operating state with negligible wear accumulation. |
| **70.0% - 84.9%** | `NORMAL_WEAR` | Olive Green (`#777C54`) | Standard progressive wear within design tolerances. |
| **50.0% - 69.9%** | `INCIPIENT_FAULT` | Muted Amber (`#C18A35`) | Detectable sub-surface degradation; thermal/vibrational anomalies. |
| **30.0% - 49.9%** | `SEVERE_DEGRADATION` | Burnt Orange (`#C65D35`) | Accelerated wear; high risk of cascading component failure. |
| **1.0% - 29.9%** | `CRITICAL_FAILURE` | Brick Red (`#B8473C`) | Extreme failure probability; immediate economic and physical hazard. |

---

## 🏭 Industrial Machine Archetypes & Dataset Specifications

The platform is parameterized with comprehensive engineering datasets across **5 critical industrial machine archetypes**:

```
1. Fluid Machinery:          High-Pressure Boiler Feed Pump (600 kW)
2. Precision Machining:      5-Axis High-Speed CNC Spindle (24,000 RPM)
3. Turbomachinery/Power:     Aeroderivative Gas Turbine (32 MW)
4. Renewable Generation:     Offshore Wind Turbine Planetary Gearbox (3.6 MW)
5. Electrical Transmission:  Step-Down Substation Power Transformer (50 MVA)
```

### High-Level Summary Comparison

| Asset Archetype | Power / Rating | Criticality | Initial Cost $P$ | Age / Life | Outage Penalty | Challenger Model | Challenger Min EUAC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Boiler Feed Pump** | 600 kW | High (Base-load) | $185,000 | 4.5 / 10 yr | $195,000 | Ultra-Efficiency IE4 Smart Pump | $42,100 / yr |
| **CNC Milling Spindle** | 24,000 RPM | Critical (Automotive) | $92,000 | 3.2 / 7 yr | $145,000 | Hybrid Ceramic Direct-Drive Spindle | $26,400 / yr |
| **Gas Turbine** | 32 MW | Severe (Grid Peaker) | $2,800,000 | 7.0 / 15 yr | $2,200,000 | H-Class Low-NOx Fast-Start Turbine | $485,000 / yr |
| **Offshore Wind Gearbox** | 3.6 MW | High (Offshore Crane) | $420,000 | 5.8 / 12 yr | $540,000 | Direct-Drive PM Generator (Gearless) | $76,500 / yr |
| **Substation Transformer**| 50 MVA | Extreme (Regional Grid)| $1,150,000 | 18.0 / 30 yr | $1,800,000 | Ester-Fluid Amorphous Core Transformer | $128,000 / yr |

---

### Machine 1: High-Pressure Feedwater Boiler Pump (600 kW)
* **ID:** `centrifugal_pump` | **Category:** Fluid Machinery | **Criticality:** High (Continuous Base-Load Thermal Plant)
* **Capital & Operational Economics:**
  * Initial Capital Cost ($P$): **$185,000**
  * Current Operating Age: **4.5 years** | Expected Design Life: **10.0 years**
  * Nominal Salvage Rate: **12%** ($22,200) | Base Annual O&M: **$14,000 / yr** (8% escalation)
  * Unplanned Catastrophic Breakdown Penalty ($C_{\text{unplanned}}$): **$195,000**
  * Procurement Lead Time: **45 days**
* **Challenger Specifications:**
  * Model: *Ultra-Efficiency IE4 Smart Variable-Flow Pump*
  * Capital Cost: **$210,000** | Year-1 O&M: **$9,500 / yr** (5% escalation)
  * Annual Energy Savings: **$16,500 / yr** | Economic Life: **8.0 years** (Salvage: $32,000)
  * Minimum EUAC ($\text{EUAC}^*_C$): **$42,100 / yr**
* **Sensor Telemetry Suite:**

| Sensor Parameter | Symbol / Key | Unit | Weight ($w_j$) | Baseline | Warning | Critical | Physical Wear Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Vibration Velocity RMS** | `vibration_rms` | mm/s | 0.28 | 2.2 | 4.5 | 7.1 | Impeller imbalance, vane pass wear |
| **NDE Bearing Temperature** | `bearing_temp` | °C | 0.22 | 62.0 | 85.0 | 105.0 | Hydrodynamic oil film breakdown |
| **Acoustic Cavitation Intensity**| `acoustic_emission` | dB | 0.20 | 48.0 | 72.0 | 88.0 | Ultrasonic vapor bubble implosion |
| **Mechanical Seal Leak Rate** | `seal_leakage_flow` | mL/min | 0.16 | 1.5 | 8.0 | 18.0 | Carbon/SiC seal face thermal distortion |
| **Lube Particle Contamination** | `oil_particle_ppm` | ppm | 0.14 | 35.0 | 120.0 | 260.0 | Metal spallation debris in lube reservoir |

---

### Machine 2: 5-Axis High-Speed CNC Milling Spindle (24,000 RPM)
* **ID:** `cnc_spindle` | **Category:** Precision Manufacturing | **Criticality:** Critical (Automotive Powertrain Line)
* **Capital & Operational Economics:**
  * Initial Capital Cost ($P$): **$92,000**
  * Current Operating Age: **3.2 years** | Expected Design Life: **7.0 years**
  * Nominal Salvage Rate: **8%** ($7,360) | Base Annual O&M: **$8,500 / yr** (11% escalation)
  * Unplanned Catastrophic Breakdown Penalty ($C_{\text{unplanned}}$): **$145,000** ($12k/hr line downtime)
  * Procurement Lead Time: **21 days**
* **Challenger Specifications:**
  * Model: *Hybrid Ceramic Direct-Drive Smart Spindle*
  * Capital Cost: **$105,000** | Year-1 O&M: **$5,200 / yr** (6% escalation)
  * Annual Energy Savings: **$8,200 / yr** | Economic Life: **6.0 years** (Salvage: $16,000)
  * Minimum EUAC ($\text{EUAC}^*_C$): **$26,400 / yr**
* **Sensor Telemetry Suite:**

| Sensor Parameter | Symbol / Key | Unit | Weight ($w_j$) | Baseline | Warning | Critical | Physical Wear Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Spindle Radial Vibration** | `vibration_rms` | mm/s | 0.32 | 0.8 | 2.2 | 4.5 | Angular contact bearing race waviness |
| **Front Hybrid Bearing Temp** | `bearing_temp` | °C | 0.25 | 44.0 | 68.0 | 85.0 | Ceramic ball thermal expansion / preload |
| **Dynamic Tool-Tip Runout** | `runout_microns` | µm | 0.25 | 1.8 | 6.5 | 12.0 | Collet taper micro-wear, tool deflection |
| **Motor Harmonic Distortion** | `motor_harmonic_thd`| % | 0.18 | 2.1 | 6.0 | 11.5 | Stator winding insulation micro-arcing |

---

### Machine 3: Heavy-Duty Aeroderivative Gas Turbine (32 MW)
* **ID:** `gas_turbine` | **Category:** Turbomachinery / Power Generation | **Criticality:** Severe (Peak-Load Grid Anchor)
* **Capital & Operational Economics:**
  * Initial Capital Cost ($P$): **$2,800,000**
  * Current Operating Age: **7.0 years** | Expected Design Life: **15.0 years**
  * Nominal Salvage Rate: **15%** ($420,000) | Base Annual O&M: **$165,000 / yr** (9% escalation)
  * Unplanned Catastrophic Breakdown Penalty ($C_{\text{unplanned}}$): **$2,200,000** (Blade liberation + penalty)
  * Procurement Lead Time: **90 days**
* **Challenger Specifications:**
  * Model: *Next-Gen H-Class Low-NOx Fast-Start Turbine*
  * Capital Cost: **$3,150,000** | Year-1 O&M: **$110,000 / yr** (5% escalation)
  * Annual Energy Savings: **$210,000 / yr** | Economic Life: **12.0 years** (Salvage: $580,000)
  * Minimum EUAC ($\text{EUAC}^*_C$): **$485,000 / yr**
* **Sensor Telemetry Suite:**

| Sensor Parameter | Symbol / Key | Unit | Weight ($w_j$) | Baseline | Warning | Critical | Physical Wear Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Turbine Casing Vibration** | `vibration_rms` | mm/s | 0.30 | 3.1 | 8.0 | 15.0 | High-pressure rotor dynamic unbalance |
| **Exhaust Gas Temp (EGT) Spread**| `bearing_temp` | °C | 0.28 | 28.0 | 58.0 | 95.0 | Combustor fuel nozzle coke deposition |
| **Rotor Blade Creep Strain** | `blade_strain_micro`| µε | 0.24 | 420.0 | 850.0 | 1350.0 | Stage-1 superalloy thermal creep stretch |
| **Lube Ferrous Debris Index** | `lube_ferrous_density`| mg/L | 0.18 | 8.0 | 35.0 | 78.0 | Squeeze-film damper bearing spallation |

---

### Machine 4: 3.6 MW Offshore Wind Turbine Planetary Gearbox
* **ID:** `wind_gearbox` | **Category:** Renewable Power | **Criticality:** High (Offshore Crane Vessel Logistics)
* **Capital & Operational Economics:**
  * Initial Capital Cost ($P$): **$420,000**
  * Current Operating Age: **5.8 years** | Expected Design Life: **12.0 years**
  * Nominal Salvage Rate: **10%** ($42,000) | Base Annual O&M: **$38,000 / yr** (12% escalation)
  * Unplanned Catastrophic Breakdown Penalty ($C_{\text{unplanned}}$): **$540,000** (Jack-up vessel charter)
  * Procurement Lead Time: **60 days**
* **Challenger Specifications:**
  * Model: *Direct-Drive Permanent Magnet Generator (Gearless)*
  * Capital Cost: **$490,000** | Year-1 O&M: **$18,000 / yr** (4% escalation)
  * Annual Energy Savings: **$32,000 / yr** | Economic Life: **10.0 years** (Salvage: $65,000)
  * Minimum EUAC ($\text{EUAC}^*_C$): **$76,500 / yr**
* **Sensor Telemetry Suite:**

| Sensor Parameter | Symbol / Key | Unit | Weight ($w_j$) | Baseline | Warning | Critical | Physical Wear Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Planetary Gearmesh Acceleration**| `vibration_rms` | g pk | 0.35 | 1.2 | 3.8 | 7.5 | Sun/planet tooth pitting, micro-spalling |
| **Intermediate Bearing Temp** | `bearing_temp` | °C | 0.25 | 55.0 | 82.0 | 102.0 | High-speed stage roller friction overload |
| **Micronic Particle Count (>4µm)** | `oil_particle_ppm` | pt/mL | 0.22 | 1200.0 | 4800.0 | 12500.0 | Abrasive gear steel particulate wear |
| **White Etch Crack Acoustic Index**| `acoustic_emission` | dB | 0.18 | 36.0 | 65.0 | 84.0 | Sub-surface hydrogen embrittlement |

---

### Machine 5: Main Step-Down Power Substation Transformer (50 MVA, 132/33 kV)
* **ID:** `substation_transformer` | **Category:** Electrical Transmission | **Criticality:** Extreme (Regional Grid Node)
* **Capital & Operational Economics:**
  * Initial Capital Cost ($P$): **$1,150,000**
  * Current Operating Age: **18.0 years** | Expected Design Life: **30.0 years**
  * Nominal Salvage Rate: **18%** ($207,000) | Base Annual O&M: **$32,000 / yr** (7% escalation)
  * Unplanned Catastrophic Breakdown Penalty ($C_{\text{unplanned}}$): **$1,800,000** (Tank explosion + blackout penalties)
  * Procurement Lead Time: **120 days**
* **Challenger Specifications:**
  * Model: *Ester-Fluid Smart Transformer with Optical DGA*
  * Capital Cost: **$1,380,000** | Year-1 O&M: **$19,000 / yr** (4% escalation)
  * Annual Energy Savings: **$48,000 / yr** | Economic Life: **25.0 years** (Salvage: $280,000)
  * Minimum EUAC ($\text{EUAC}^*_C$): **$128,000 / yr**
* **Sensor Telemetry Suite:**

| Sensor Parameter | Symbol / Key | Unit | Weight ($w_j$) | Baseline | Warning | Critical | Physical Wear Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Acetylene Gas ($C_2H_2$) DGA** | `dissolved_gas_c2h2` | ppm | 0.35 | 0.4 | 4.0 | 15.0 | High-energy dielectric arcing across turns |
| **Top Oil & Winding Hotspot** | `bearing_temp` | °C | 0.25 | 65.0 | 98.0 | 122.0 | Magnetic core losses & transformer overload |
| **Moisture in Dielectric Oil** | `moisture_in_oil` | ppm | 0.22 | 12.0 | 28.0 | 45.0 | Paper cellulose hydrolysis, breakdown risk |
| **Furan Concentration (2-FAL)** | `furan_compounds` | mg/L | 0.18 | 0.15 | 1.2 | 3.5 | Irreversible cellulose depolymerization (DP) |

---

## 🧪 Pre-Configured Telemetry Test Scenarios

The system includes 4 benchmark stress scenarios across all machines (`data/sample_telemetry.json`):

| Scenario ID | Name & Description | Pump Vibration (mm/s) | CNC Runout (µm) | Turbine Strain (µε) | Gearbox Accel (g pk) | Transformer $C_2H_2$ (ppm) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `healthy_nominal` | **Nominal Healthy Baseline:** Design operation with pristine telemetry. | 2.3 | 1.9 | 435.0 | 1.3 | 0.45 |
| `incipient_fault` | **Incipient Bearing Micro-Flaking:** Early sub-surface fatigue onset. | 4.2 | 5.4 | 760.0 | 3.2 | 3.20 |
| `severe_wear` | **Severe Lubricant Breakdown:** Critical vibration spike and elevated friction. | 5.9 | 9.8 | 1180.0 | 6.1 | 11.20 |
| `critical_emergency`| **Emergency Runaway (Imminent Failure):** ISO danger thresholds breached. | 8.4 | 16.5 | 1650.0 | 8.9 | 22.50 |

---

## 📊 Comparative Case Study: Conventional vs. AI Replacement Economics

### Boiler Feedwater Pump (600 kW) Experimental Results

```
Conventional Strategy:
  [Year 1] ─── [Year 2] ─── [Year 3] ─── [Month 42: SEIZURE FAILURE] ─── [Year 6: Scheduled Overhaul]
                                              ▲
                                              │ Unplanned Downtime Loss: $195,000
                                              │ Total 10-Yr Cost: $573,200

AI-Driven PdM Strategy:
  [Year 1] ─── [Year 2] ─── [Month 36: Alert HI=56%] ─── [Month 38: Procure] ─── [Month 40: Clean Swap]
                                  ▲                             ▲
                                  │ MC_t crosses Challenger     │ Planned 45-day lead time
                                  │ Total 10-Yr Cost: $191,486  │ Net Savings: $381,714 (66.6%)
```

1. **Under Conventional Fixed Schedule:**
   * Maintenance assumes fixed replacement at Year 6 ($n^* = 6$).
   * At **Month 42**, unmonitored impeller cavitation and bearing spallation trigger catastrophic rotor seizure.
   * Plant incurs emergency downtime loss of **$195,000**, escalating cumulative 10-year present-value expenditure to **$573,200**.
2. **Under AI-Driven PdM Analysis:**
   * At **Month 36**, ultrasonic cavitation ($72\text{ dB}$) and vibration velocity ($4.8\text{ mm/s}$) lower $HI$ to **$56.5\%$**.
   * Marginal cost escalates to **$48,200/yr**, crossing the Challenger EUAC benchmark (**$42,100/yr**).
   * Recommendation switches to **`PROCURE & SCHEDULE REPLACEMENT`** within the **45-day lead-time window**.
   * Controlled replacement executes before catastrophic breakdown occurs.
   * **Net Lifecycle Savings:** **$381,714** (a **$66.6\%$ reduction** in total life cycle cost).

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/assets` | Returns all 5 machine profiles with sensor metadata and Challenger specs. |
| `GET` | `/api/scenarios` | Returns the 4 pre-configured degradation benchmark scenarios. |
| `POST` | `/api/evaluate` | Evaluates complete EEFM replacement economics (EUAC, $MC_t$, $CR$, RUL, XAI). |
| `POST` | `/api/simulate-stream` | Generates live SCADA telemetry drift stream with Gaussian noise. |
| `GET` | `/api/audit-report/{asset_id}`| Generates executive financial audit report with JSON download. |

---

## 📚 References & Engineering Standards

1. **Blank, L., & Tarquin, A.** (2018). *Basics of Engineering Economy* (3rd ed.). McGraw-Hill Education. (Capital Recovery, EUAC, and Marginal Cost Replacement Analysis).
2. **ISO 10816-3 / ISO 20816-1:** *Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts.*
3. **IEEE Std C57.104-2019:** *IEEE Guide for the Interpretation of Gases Generated in Mineral Oil-Immersed Transformers.*
4. **IEC 61400-4:** *Wind turbines — Part 4: Design requirements for wind turbine gearboxes.*
5. **Weibull, W.** (1951). *A statistical distribution function of wide applicability.* Journal of Applied Mechanics.
