"""
Build script to embed CSS and JS into static/index.html to ensure 100% self-contained styling.
Applies Industrial Editorial + Financial Intelligence Theme, Clean Vector Monogram, and SVG Favicon.
"""

import os

base_dir = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(base_dir, 'static', 'css', 'style.css'), 'r', encoding='utf-8') as f:
    css_content = f.read()

with open(os.path.join(base_dir, 'static', 'js', 'eefm_simulator.js'), 'r', encoding='utf-8') as f:
    sim_js = f.read()

with open(os.path.join(base_dir, 'static', 'js', 'charts.js'), 'r', encoding='utf-8') as f:
    charts_js = f.read()

with open(os.path.join(base_dir, 'static', 'js', 'app.js'), 'r', encoding='utf-8') as f:
    app_js = f.read()

with open(os.path.join(base_dir, 'static', 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

split_token = "  <!-- Embedded Client-Side Analytical Simulation Engine -->"
parts = html.split(split_token)
if len(parts) != 2:
    print(f"Error: expected 2 parts, got {len(parts)}")
    exit(1)

html_body = parts[0]

# 1. Update Head (Favicon, Fonts, Title)
head_old = """  <meta name="description" content="AI-Driven Asset Replacement Decision Support Tool for Predictive Maintenance and Engineering Economics (EEFM). Compares condition-based EUAC models against conventional fixed depreciation schedules.">
  <title>AI Asset Replacement Decision Support System | EEFM Prognostics</title>

  <!-- Google Web Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">"""

head_new = """  <meta name="description" content="AI-Driven Asset Replacement Decision Support Tool for Predictive Maintenance and Engineering Economics (EEFM). Compares condition-based EUAC models against conventional fixed depreciation schedules.">
  <!-- Industrial Asset Monogram Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23252722'%3E%3Crect width='24' height='24' rx='4' fill='%23252722'/%3E%3Cpath d='M4 18h16M4 18V6M4 18l5-6 4 4 7-8' fill='none' stroke='%23C65D35' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='20' cy='8' r='2' fill='%23C65D35'/%3E%3C/svg%3E">
  <title>EEFM Asset Replacement Intelligence | Industrial Decision Support</title>

  <!-- Google Web Fonts: Inter (UI/Sans), Fraunces (Editorial), JetBrains Mono (Data/Math) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">"""

if head_old in html_body:
    html_body = html_body.replace(head_old, head_new)

# 2. Update embedded style block
style_open = html_body.find("<style>")
style_close = html_body.find("</style>")
if style_open != -1 and style_close != -1:
    style_close += len("</style>")
    new_style_tag = f"""<style>
{css_content}
  </style>"""
    html_body = html_body[:style_open] + new_style_tag + html_body[style_close:]

# 3. Brand Logo Badge
badge_old = """        <div class="brand-badge" id="brand-logo-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" style="width:24px; height:24px; max-width:24px; max-height:24px; display:block;">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#070b14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>"""

badge_new = """        <div class="brand-badge" id="brand-logo-badge" title="EEFM Asset Replacement Intelligence">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="m19 9-5 5-4-4-3 3"></path>
            <circle cx="19" cy="9" r="1.5" fill="#FFFFFF"></circle>
          </svg>
        </div>"""
html_body = html_body.replace(badge_old, badge_new)

# 4. Brand Titles & Subtitles
title_old = """          <h1 class="brand-title">AI Asset Replacement Decision Support System</h1>
          <div class="brand-subtitle">
            <span>Engineering Economics &amp; Financial Management (EEFM)</span>
            <span class="status-pill">
              <span class="pulse-dot"></span> AI PdM Active
            </span>
          </div>"""

title_new = """          <h1 class="brand-title">EEFM Asset Replacement Intelligence</h1>
          <div class="brand-subtitle">
            <span>Industrial Engineering Economics &amp; Predictive Lifecycle Optimization</span>
            <span class="status-pill">
              <span class="pulse-dot"></span> Telemetry Active
            </span>
          </div>"""
html_body = html_body.replace(title_old, title_new)

# 5. Header Buttons
btns_old = """        <button class="btn btn-secondary" id="btn-open-math">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          EEFM Formulas
        </button>

        <button class="btn btn-primary" id="btn-export-report">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Audit Report
        </button>"""

btns_new = """        <button class="btn btn-secondary" id="btn-open-math">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          EEFM Formulations
        </button>

        <button class="btn btn-primary" id="btn-export-report">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Audit Dossier
        </button>"""
html_body = html_body.replace(btns_old, btns_new)

# 6. Urgency Badge
urgency_old = """          <span class="status-pill" id="decision-urgency-badge" style="background: rgba(245,158,11,0.15); color: var(--amber-warning); border-color: rgba(245,158,11,0.3)">
            MODERATE
          </span>"""
urgency_new = """          <span class="status-pill" id="decision-urgency-badge">
            MODERATE
          </span>"""
html_body = html_body.replace(urgency_old, urgency_new)

# 7. Meter Circles
meter_old = """            <circle class="meter-bg-circle" cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"></circle>
            <circle class="meter-val-circle" id="meter-val-circle" cx="70" cy="70" r="60" fill="none" stroke="#00f2fe" stroke-width="10" stroke-linecap="round"></circle>"""

meter_new = """            <circle class="meter-bg-circle" cx="70" cy="70" r="60" fill="none" stroke="var(--border-light)" stroke-width="9"></circle>
            <circle class="meter-val-circle" id="meter-val-circle" cx="70" cy="70" r="60" fill="none" stroke="var(--accent-orange)" stroke-width="9" stroke-linecap="square"></circle>"""
html_body = html_body.replace(meter_old, meter_new)

# 8. EUAC Chart Legend
euac_legend_old = """              <div class="chart-legend">
                <span class="legend-item"><span class="legend-color" style="background:#00f2fe"></span> Total EUAC</span>
                <span class="legend-item"><span class="legend-color" style="background:#3b82f6"></span> Capital Rec. (CR)</span>
                <span class="legend-item"><span class="legend-color" style="background:#10b981"></span> O&amp;M</span>
                <span class="legend-item"><span class="legend-color" style="background:#ef4444"></span> Risk Cost</span>
              </div>"""

euac_legend_new = """              <div class="chart-legend">
                <span class="legend-item"><span class="legend-color" style="background:var(--accent-orange)"></span> Total EUAC</span>
                <span class="legend-item"><span class="legend-color" style="background:#252722"></span> Capital Rec. (CR)</span>
                <span class="legend-item"><span class="legend-color" style="background:#777C54"></span> O&amp;M</span>
                <span class="legend-item"><span class="legend-color" style="background:#B8473C"></span> Risk Cost</span>
              </div>"""
html_body = html_body.replace(euac_legend_old, euac_legend_new)

# 9. Marginal Cost Legend
marginal_legend_old = """              <div class="chart-legend">
                <span class="legend-item"><span class="legend-color" style="background:var(--cyan-primary)"></span> Marginal Cost MC(t)</span>
                <span class="legend-item"><span class="legend-color" style="background:var(--amber-warning)"></span> Challenger EUAC*</span>
              </div>"""

marginal_legend_new = """              <div class="chart-legend">
                <span class="legend-item"><span class="legend-color" style="background:#252722"></span> Marginal Cost MC(t)</span>
                <span class="legend-item"><span class="legend-color" style="background:#777C54"></span> Challenger EUAC*</span>
              </div>"""
html_body = html_body.replace(marginal_legend_old, marginal_legend_new)

# 10. RUL Legend
rul_legend_old = """                <div class="chart-legend">
                  <span class="legend-item"><span class="legend-color" style="background:#00f2fe"></span> P50 Expected</span>
                  <span class="legend-item"><span class="legend-color" style="background:rgba(0,242,254,0.3)"></span> P10-P90 Confidence Cone</span>
                  <span class="legend-item"><span class="legend-color" style="background:#ef4444"></span> 20% Critical Failure Threshold</span>
                </div>"""

rul_legend_new = """                <div class="chart-legend">
                  <span class="legend-item"><span class="legend-color" style="background:var(--accent-orange)"></span> P50 Expected</span>
                  <span class="legend-item"><span class="legend-color" style="background:rgba(198,93,53,0.22)"></span> P10-P90 Confidence Cone</span>
                  <span class="legend-item"><span class="legend-color" style="background:#B8473C"></span> 20% Critical Failure Limit</span>
                </div>"""
html_body = html_body.replace(rul_legend_old, rul_legend_new)

# 11. XAI Note Box
xai_box_old = """            <div style="background: rgba(255, 255, 255, 0.02); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-top: 24px;">
              <div style="font-size: 0.76rem; font-weight: 700; color: var(--cyan-primary); text-transform: uppercase; margin-bottom: 6px;">
                Physical Degradation Model
              </div>
              <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.5;">
                Sensor inputs are weighted according to failure mode severity. Mechanical wear exhibits exponential damage accumulation:
                <br>
                <code style="color: var(--cyan-primary); font-family: var(--font-mono); font-size: 0.74rem;">
                  HI(t) = 100 &times; exp(-1.45 &times; &sum; w_j &times; [stress_j]^1.85)
                </code>
              </p>
            </div>"""

xai_box_new = """            <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-top: 24px;">
              <div style="font-size: 0.70rem; font-weight: 700; color: var(--accent-orange); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; font-family: var(--font-mono);">
                Physical Degradation Model
              </div>
              <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.5;">
                Sensor inputs are weighted according to failure mode severity. Mechanical wear exhibits exponential damage accumulation:
                <br>
                <code style="color: var(--accent-orange); font-family: var(--font-mono); font-size: 0.75rem;">
                  HI(t) = 100 &times; exp(-1.45 &times; &sum; w_j &times; [stress_j]^1.85)
                </code>
              </p>
            </div>"""
html_body = html_body.replace(xai_box_old, xai_box_new)

# 12. Policy Comparison Headers
policy_conv_old = """          <div class="policy-card conventional">
            <div class="policy-header">
              <div class="policy-title" style="color: var(--rose-danger)">Conventional Fixed Depreciation Policy</div>
              <span class="status-pill" style="background: rgba(239,68,68,0.15); color: var(--rose-danger); border-color: rgba(239,68,68,0.3)">
                SUBOPTIMAL
              </span>
            </div>"""

policy_conv_new = """          <div class="policy-card conventional">
            <div class="policy-header">
              <div class="policy-title" style="color: var(--status-critical)">Conventional Fixed Depreciation Policy</div>
              <span class="status-pill" style="background: var(--status-critical-subtle); color: var(--status-critical); border-color: var(--status-critical-border)">
                SUBOPTIMAL
              </span>
            </div>"""
html_body = html_body.replace(policy_conv_old, policy_conv_new)

policy_pdm_old = """          <div class="policy-card pdm-ai">
            <div class="policy-header">
              <div class="policy-title" style="color: var(--cyan-primary)">AI-Driven Condition-Based PdM Policy</div>
              <span class="status-pill" style="background: rgba(0,242,254,0.15); color: var(--cyan-primary); border-color: rgba(0,242,254,0.3)">
                OPTIMAL
              </span>
            </div>"""

policy_pdm_new = """          <div class="policy-card pdm-ai">
            <div class="policy-header">
              <div class="policy-title" style="color: var(--text-main)">AI-Driven Condition-Based PdM Policy</div>
              <span class="status-pill" style="background: var(--accent-orange-subtle); color: var(--accent-orange); border-color: var(--accent-orange-border)">
                OPTIMAL
              </span>
            </div>"""
html_body = html_body.replace(policy_pdm_old, policy_pdm_new)

# 13. Cashflow Legend
cashflow_legend_old = """            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color" style="background:rgba(239,68,68,0.7)"></span> Conventional (Unmonitored)</span>
              <span class="legend-item"><span class="legend-color" style="background:#00f2fe"></span> AI-PdM Condition-Based</span>
            </div>"""

cashflow_legend_new = """            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color" style="background:#B8473C"></span> Conventional (Unmonitored)</span>
              <span class="legend-item"><span class="legend-color" style="background:#777C54"></span> AI-PdM Condition-Based</span>
            </div>"""
html_body = html_body.replace(cashflow_legend_old, cashflow_legend_new)

# 14. Global replacements for icons and colors in html_body
html_body = html_body.replace('stroke="var(--cyan-primary)"', 'stroke="var(--accent-orange)"')
html_body = html_body.replace('stroke="var(--violet-accent)"', 'stroke="var(--accent-olive)"')
html_body = html_body.replace('stroke="var(--amber-warning)"', 'stroke="var(--status-warning)"')
html_body = html_body.replace('stroke="var(--rose-danger)"', 'stroke="var(--status-critical)"')
html_body = html_body.replace('stroke="var(--emerald-success)"', 'stroke="var(--status-positive)"')
html_body = html_body.replace('style="color:var(--cyan-primary)"', 'style="color:var(--accent-orange)"')
html_body = html_body.replace('style="color: var(--cyan-primary)"', 'style="color: var(--accent-orange)"')

# 15. Reconstruct full document
new_scripts = f"""{split_token}
  <script>
{sim_js}
  </script>

  <!-- Embedded Canvas Chart Renderers -->
  <script>
{charts_js}
  </script>

  <!-- Embedded Application Controller -->
  <script>
{app_js}
  </script>
</body>
</html>
"""

full_html = html_body + new_scripts

target_index = os.path.join(base_dir, 'static', 'index.html')
with open(target_index, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f"Successfully bundled Industrial Editorial theme into static/index.html! Total size: {len(full_html)} bytes.")
