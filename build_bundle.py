"""
Build script to embed CSS and JS into static/index.html to ensure 100% self-contained styling.
Guarantees SVGs never expand into giant unstyled shapes and prevents any 404 network errors.
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

# Replace <link rel="stylesheet" href="css/style.css"> with embedded <style>
style_block = f"""  <!-- Embedded Core Design System Stylesheet -->
  <style>
{css_content}
  </style>
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/static/css/style.css">
  <link rel="stylesheet" href="css/style.css">"""

if '<link rel="stylesheet" href="css/style.css">' in html:
    html = html.replace('<link rel="stylesheet" href="css/style.css">', style_block)

# Fix brand svg so it has explicit width, height, and display constraints
html = html.replace(
    '<svg viewBox="0 0 24 24">',
    '<svg width="24" height="24" viewBox="0 0 24 24" style="width:24px; height:24px; max-width:24px; max-height:24px; display:block;">'
)

# Fix meter svg and default circle fills
html = html.replace(
    '<svg class="meter-svg" viewBox="0 0 140 140">',
    '<svg class="meter-svg" width="140" height="140" viewBox="0 0 140 140" style="width:140px; height:140px; max-width:140px; max-height:140px;">'
)
html = html.replace(
    '<circle class="meter-bg-circle" cx="70" cy="70" r="60"></circle>',
    '<circle class="meter-bg-circle" cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"></circle>'
)
html = html.replace(
    '<circle class="meter-val-circle" id="meter-val-circle" cx="70" cy="70" r="60"></circle>',
    '<circle class="meter-val-circle" id="meter-val-circle" cx="70" cy="70" r="60" fill="none" stroke="#00f2fe" stroke-width="10" stroke-linecap="round"></circle>'
)

# Replace script links with embedded scripts plus fallbacks
script_block = f"""  <!-- Embedded Client-Side Analytical Simulation Engine -->
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
"""

old_scripts = """  <!-- Client-Side Scripts -->
  <script src="js/eefm_simulator.js"></script>
  <script src="js/charts.js"></script>
  <script src="js/app.js"></script>"""

if old_scripts in html:
    html = html.replace(old_scripts, script_block)

with open(os.path.join(base_dir, 'static', 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Successfully updated static/index.html! Total size: {len(html)} bytes.")
