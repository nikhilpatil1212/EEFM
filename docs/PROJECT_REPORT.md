# Engineering Economics & Financial Management (EEFM) Mini Project Report
## AI-Driven Asset Replacement Decision Support Tool for Predictive Maintenance

---

### Abstract
Conventional asset replacement analysis in industrial engineering relies on predetermined, static depreciation schedules (e.g., Straight-Line, MACRS, or constant geometric decay) and assumes deterministic annual operating and maintenance (O&M) cost escalations. This approach fails to account for real-time equipment degradation driven by dynamic mechanical, thermal, electrical, and tribological stresses. Consequently, industrial plants experience either:
1. **Premature Replacement:** Discarding healthy assets operating under gentle duty cycles, incurring unnecessary capital expenditure and wasting residual service life.
2. **Suboptimal Delayed Replacement & Catastrophic Breakdown:** Missing rapid mechanical degradation (such as bearing flaking, impeller cavitation, or insulation breakdown), leading to unexpected catastrophic failure, severe production downtime penalties, and safety hazards.

This project develops an **AI-Driven Replacement Decision Support Tool** that merges real-time condition monitoring (PdM) with rigorous Engineering Economics and Financial Management (EEFM) models. By dynamically quantifying health-dependent Weibull failure probabilities, condition-adjusted salvage values, and real-time failure risk costs, the system computes the dynamic **Equivalent Uniform Annual Cost (EUAC)** and **Marginal Cost ($MC_t$)** of retaining the existing asset (Defender) against state-of-the-art replacement assets (Challenger).

---

### 1. Problem Statement & Motivation
In traditional engineering economics, the replacement problem (Defender vs. Challenger) is framed around identifying the **economic life** ($n^*$) that minimizes the Equivalent Uniform Annual Cost:

$$\min_{n} \text{EUAC}(n)$$

However, conventional methods suffer from critical vulnerabilities:
* **Decoupling from Physical Health:** Asset deterioration is treated as a function of calendar time rather than cumulative stress, vibration severity (ISO 10816), lubrication contamination, and operating duty cycle.
* **Omission of Catastrophic Risk Premiums:** While planned maintenance costs are budgeted, the stochastic risk cost of catastrophic unplanned failure is omitted from marginal cost calculations.
* **Rigid Capital Allocation:** Procurement lead times are often 30 to 120 days. If an asset degrades rapidly between scheduled overhauls, the plant cannot procure a replacement in time, resulting in prolonged emergency downtime ($10,000 to $150,000+ per hour in continuous process industries).

---

### 2. Mathematical Framework & Formulations

#### 2.1 Capital Recovery Cost with Return
For an initial capital cost $P$ and salvage value $S_n$ at year $n$, under a Minimum Attractive Rate of Return (MARR) $i$:

$$\text{CR}(n) = (P - S_n)(A/P, i, n) + i \cdot S_n = P(A/P, i, n) - S_n(A/F, i, n)$$

Where the standard capital recovery factor is:
$$(A/P, i, n) = \frac{i(1 + i)^n}{(1 + i)^n - 1}$$

and the sinking fund factor is:
$$(A/F, i, n) = \frac{i}{(1 + i)^n - 1}$$

#### 2.2 Multi-Sensor AI Health Index ($HI(t)$)
The asset's real-time condition is captured via multi-parameter sensor telemetry. For each sensor $j$, normalized stress is calculated relative to healthy baseline $x_{j,\text{base}}$, warning limit $x_{j,\text{warn}}$, and critical danger limit $x_{j,\text{crit}}$:

$$\text{Stress}_j(t) = \begin{cases}
0, & x_j(t) \le x_{j,\text{base}} \\
0.4 \left(\frac{x_j(t) - x_{j,\text{base}}}{x_{j,\text{warn}} - x_{j,\text{base}}}\right), & x_{j,\text{base}} < x_j(t) \le x_{j,\text{warn}} \\
0.4 + 0.6 \left(\frac{x_j(t) - x_{j,\text{warn}}}{x_{j,\text{crit}} - x_{j,\text{warn}}}\right), & x_{j,\text{warn}} < x_j(t) \le x_{j,\text{crit}} \\
1.0 + 0.5 \left(\frac{x_j(t) - x_{j,\text{crit}}}{x_{j,\text{crit}} - x_{j,\text{warn}}}\right), & x_j(t) > x_{j,\text{crit}}
\end{cases}$$

The non-linear damage accumulation penalty yields the composite Health Index:
$$HI(t) = 100 \times \exp\left( -1.45 \sum_{j=1}^m w_j \cdot [\text{Stress}_j(t)]^{1.85} \right), \quad HI(t) \in [1\%, 100\%]$$

#### 2.3 Condition-Adjusted Weibull Reliability & Risk Cost
Equipment wear-out adheres to a Weibull distribution with shape parameter $\beta > 1$ (wear-out stage, typically $\beta = 2.5 - 3.2$). The characteristic life $\eta$ is conditioned on the real-time Health Index:

$$\eta_{\text{cond}}(HI) = \eta_0 \cdot \left(\frac{HI(t)}{100}\right)^{1.6}$$

The cumulative probability of failure by period $t$ is:
$$F(t \mid HI) = 1 - \exp\left( -\left[ \frac{t}{\eta_{\text{cond}}(HI)} \right]^\beta \right)$$

The real-time failure risk cost per period is:
$$C_{\text{risk}}(t) = F(t \mid HI) \times C_{\text{unplanned\_failure\_consequence}}$$

where $C_{\text{unplanned\_failure\_consequence}}$ encompasses emergency overhaul labor, collateral equipment damage, and lost production downtime.

#### 2.4 Total Condition-Adjusted EUAC
The annualized total cost of operating the Defender for an evaluation horizon of $n$ periods:

$$\text{EUAC}(n) = \text{CR}(n) + \left[ \sum_{t=1}^n \frac{O\&M_{\text{adj}}(t) + C_{\text{risk}}(t)}{(1 + i)^t} \right] \times (A/P, i, n)$$

where $O\&M_{\text{adj}}(t) = O\&M_{\text{base}}(t) \cdot \left[ 1 + 2.5 \left(\frac{100 - HI(t)}{100}\right)^{2.2} \right]$.

#### 2.5 Marginal Cost Analysis (Defender vs. Challenger)
The marginal cost $MC_{t}$ of keeping the Defender for year $t$, given salvage values $S_{t-1}$ and $S_t$:

$$MC_t = (S_{t-1} - S_t) + i \cdot S_{t-1} + O\&M_{\text{adj}}(t) + C_{\text{risk}}(t)$$

**Optimal Decision Rule:**
1. If $MC_t \le \text{EUAC}^*_{\text{challenger}}$ and $RUL > \text{Lead Time}$, **RETAIN DEFENDER**.
2. If $MC_t > \text{EUAC}^*_{\text{challenger}}$ or $RUL \le \text{Lead Time}$, **PROCURE & SCHEDULE REPLACEMENT**.
3. If $HI(t) < 25\%$ or $RUL \le 1 \text{ month}$, **EMERGENCY REPLACEMENT (CRITICAL)**.

---

### 3. Industrial Asset Archetypes & Experimental Results

The decision support tool was evaluated across five industrial asset archetypes:

| Asset Archetype | Power / Rating | Criticality | Initial Cost ($P$) | Challenger Min EUAC | Unplanned Failure Penalty |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Boiler Feedwater Pump** | 600 kW | High (Continuous Process) | $185,000 | $42,100 / yr | $195,000 |
| **CNC High-Speed Spindle** | 24,000 RPM | Critical (Automotive Line) | $92,000 | $26,400 / yr | $145,000 |
| **Aeroderivative Gas Turbine** | 32 MW | Severe (Peaking Power) | $2,800,000 | $485,000 / yr | $2,200,000 |
| **Offshore Wind Gearbox** | 3.6 MW | High (Offshore Crane Vessel) | $420,000 | $76,500 / yr | $540,000 |
| **Substation Transformer** | 50 MVA | Extreme (Regional Grid Node)| $1,150,000 | $128,000 / yr | $1,800,000 |

#### Key Finding: Avoidance of Catastrophic Failure Penalties
Under the Boiler Feed Pump scenario:
* **Conventional Fixed Schedule:** Assumes scheduled overhaul at Year 6. At Month 42, an unmonitored cavitation and bearing wear event causes catastrophic rotor seizure, triggering an unplanned downtime penalty of **$195,000** and escalating 10-year lifecycle cost to **$573,000**.
* **AI-Driven PdM Analysis:** Detects ultrasonic acoustic emissions and vibration velocity rise at Month 36 ($HI = 56.5\%$). Marginal cost reaches **$48,200/yr**, crossing the Challenger EUAC benchmark ($42,100/yr$). The tool triggers **"PROCURE & SCHEDULE REPLACEMENT"** with 45-day lead-time planning.
* **Net Lifecycle Savings:** **$381,714** (a **66.6%** reduction in total life cycle cost).

---

### 4. Software Architecture & Deliverables
The project deliverables include:
* **Interactive Web Cockpit:** Single Page Application (HTML5 / Vanilla CSS / Vanilla JS) with responsive Canvas charts, real-time telemetry sliders, and scenario chips.
* **Prognostic Simulation Engine:** Standalone client-side simulator (`eefm_simulator.js`) and high-performance Python FastAPI backend (`app.py`, `models/`).
* **Explainable AI (XAI):** Feature attribution waterfall showing sensor contributions to wear.
* **Automated Audit Reporting:** Real-time generation of executive replacement decision reports with printable PDF formatting and JSON data export.
