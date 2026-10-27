/**
 * Interactive Canvas-based Chart Rendering Engine for EEFM Decision Tool.
 * Theme: Industrial Editorial + Financial Intelligence
 * Palette: Charcoal (#252722), Burnt Orange (#C65D35), Olive Green (#777C54), Warm Gray (#DEDCD4), Brick Red (#B8473C)
 */

const EEFMCharts = (function() {

  // Helper to setup high-DPI retina-sharp canvas
  function setupCanvas(canvas) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual pixel dimensions
    canvas.width = Math.max(300, Math.floor(rect.width * dpr));
    canvas.height = Math.max(200, Math.floor(rect.height * dpr));
    
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  }

  // 1. EUAC & Component Cost Curves Chart
  function renderEUACChart(canvasId, schedule, crossoverYear) {
    const canvas = document.getElementById(canvasId);
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);
    if (!schedule || schedule.length === 0) return;

    const padLeft = 70;
    const padRight = 30;
    const padTop = 32;
    const padBottom = 38;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Find max value across series
    let maxVal = 0;
    schedule.forEach(d => {
      maxVal = Math.max(maxVal, d.total_euac, d.capital_recovery_cr, d.annualized_om, d.annualized_risk);
    });
    maxVal = Math.ceil(maxVal * 1.15 / 10000) * 10000;
    if (maxVal === 0) maxVal = 100000;

    // Draw horizontal grid lines & Y-axis labels
    ctx.strokeStyle = "rgba(37, 39, 34, 0.08)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#77796F";
    ctx.textAlign = "right";

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = padTop + chartH - (i / steps) * chartH;
      const val = (i / steps) * maxVal;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      const label = val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${Math.round(val / 1000)}k`;
      ctx.fillText(label, padLeft - 10, y + 3);
    }

    // X-axis coordinates helper
    const xStep = chartW / (schedule.length - 1);
    function getX(i) { return padLeft + i * xStep; }
    function getY(v) { return padTop + chartH - (v / maxVal) * chartH; }

    // X-axis labels
    ctx.textAlign = "center";
    ctx.fillStyle = "#77796F";
    ctx.font = "10px 'JetBrains Mono', monospace";
    schedule.forEach((d, i) => {
      const x = getX(i);
      ctx.fillText(`Yr ${d.keep_years}`, x, height - padBottom + 18);
    });

    // Helper to draw smooth series
    function drawSeries(key, color, strokeWidth = 1.8, dashed = false) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      if (dashed) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);

      schedule.forEach((d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Point markers
      schedule.forEach((d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        ctx.beginPath();
        ctx.arc(x, y, strokeWidth > 2.5 ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Individual component curves (Restrained industrial palette)
    drawSeries("capital_recovery_cr", "#252722", 1.8, true);   // Charcoal: Capital Recovery
    drawSeries("annualized_om", "#777C54", 1.8, true);          // Olive Green: O&M
    drawSeries("annualized_risk", "#B8473C", 1.8, true);        // Brick Red: Risk Cost

    // Total EUAC curve (Dominant Burnt Orange Accent)
    drawSeries("total_euac", "#C65D35", 3.0, false);

    // Highlight minimum EUAC point
    let minIdx = 0;
    let minVal = schedule[0].total_euac;
    schedule.forEach((d, i) => {
      if (d.total_euac < minVal) {
        minVal = d.total_euac;
        minIdx = i;
      }
    });

    const optX = getX(minIdx);
    const optY = getY(minVal);

    // Draw minimum indicator ring
    ctx.beginPath();
    ctx.arc(optX, optY, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = "#C65D35";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(optX, optY, 10, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(198, 93, 53, 0.4)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = "#252722";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`MIN EUAC: $${minVal.toLocaleString()}`, optX, optY - 14);
  }

  // 2. Marginal Cost (Defender) vs Challenger EUAC Chart
  function renderMarginalCostChart(canvasId, schedule, challengerEUAC, crossoverYear) {
    const canvas = document.getElementById(canvasId);
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);
    if (!schedule || schedule.length === 0) return;

    const padLeft = 70;
    const padRight = 30;
    const padTop = 32;
    const padBottom = 38;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    let maxVal = Math.max(challengerEUAC * 1.3, ...schedule.map(d => d.marginal_cost));
    maxVal = Math.ceil(maxVal * 1.1 / 10000) * 10000;
    if (maxVal === 0) maxVal = 100000;

    // Grid lines & Y-axis labels
    ctx.strokeStyle = "rgba(37, 39, 34, 0.08)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#77796F";
    ctx.textAlign = "right";

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = padTop + chartH - (i / steps) * chartH;
      const val = (i / steps) * maxVal;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      const label = val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${Math.round(val / 1000)}k`;
      ctx.fillText(label, padLeft - 10, y + 3);
    }

    const xStep = chartW / (schedule.length - 1);
    function getX(i) { return padLeft + i * xStep; }
    function getY(v) { return padTop + chartH - (v / maxVal) * chartH; }

    // X Labels
    ctx.textAlign = "center";
    ctx.fillStyle = "#77796F";
    ctx.font = "10px 'JetBrains Mono', monospace";
    schedule.forEach((d, i) => {
      ctx.fillText(`Yr ${d.keep_years}`, getX(i), height - padBottom + 18);
    });

    // Horizontal Challenger EUAC line (Olive Green / Amber benchmark dashed)
    const challY = getY(challengerEUAC);
    ctx.beginPath();
    ctx.strokeStyle = "#777C54";
    ctx.lineWidth = 2.0;
    ctx.setLineDash([5, 4]);
    ctx.moveTo(padLeft, challY);
    ctx.lineTo(width - padRight, challY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#777C54";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`CHALLENGER MIN EUAC: $${challengerEUAC.toLocaleString()}`, width - padRight, challY - 8);

    // Defender Marginal Cost Line (Charcoal rising to Burnt Orange & Brick Red)
    const grad = ctx.createLinearGradient(padLeft, 0, width - padRight, 0);
    grad.addColorStop(0, "#252722");
    grad.addColorStop(0.55, "#C65D35");
    grad.addColorStop(1, "#B8473C");

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.8;
    schedule.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.marginal_cost);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw markers
    schedule.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.marginal_cost);
      const isBreached = d.marginal_cost > challengerEUAC;

      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isBreached ? "#B8473C" : "#252722";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Mark Crossover Point
    if (crossoverYear !== null && crossoverYear <= schedule.length) {
      const crossIdx = crossoverYear - 1;
      const crossX = getX(crossIdx);

      ctx.strokeStyle = "rgba(184, 71, 60, 0.45)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(crossX, padTop);
      ctx.lineTo(crossX, height - padBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#B8473C";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`REPLACE CROSSOVER (YR ${crossoverYear})`, crossX, padTop - 10);
    }
  }

  // 3. RUL Degradation Trajectory Chart (Confidence Cone)
  function renderRULTrajectoryChart(canvasId, trajectory, failureThreshold = 20.0) {
    const canvas = document.getElementById(canvasId);
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);
    if (!trajectory || trajectory.length === 0) return;

    const padLeft = 55;
    const padRight = 30;
    const padTop = 28;
    const padBottom = 35;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const maxM = trajectory[trajectory.length - 1].month_offset || 24;

    function getX(m) { return padLeft + (m / maxM) * chartW; }
    function getY(hi) { return padTop + chartH - (hi / 100.0) * chartH; }

    // Grid lines for HI (0 to 100%)
    ctx.strokeStyle = "rgba(37, 39, 34, 0.08)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#77796F";
    ctx.textAlign = "right";

    [0, 20, 50, 75, 100].forEach(hi => {
      const y = getY(hi);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(`${hi}%`, padLeft - 8, y + 3);
    });

    // Critical Threshold Line at 20% (Brick Red)
    const threshY = getY(failureThreshold);
    ctx.beginPath();
    ctx.strokeStyle = "#B8473C";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padLeft, threshY);
    ctx.lineTo(width - padRight, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#B8473C";
    ctx.textAlign = "right";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillText("CRITICAL FAILURE LIMIT (20%)", width - padRight, threshY - 6);

    // Draw shaded confidence cone (P10 to P90)
    ctx.beginPath();
    trajectory.forEach((d, i) => {
      const x = getX(d.month_offset);
      const y = getY(d.hi_p90 || d.hi_p50);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let i = trajectory.length - 1; i >= 0; i--) {
      const d = trajectory[i];
      const x = getX(d.month_offset);
      const y = getY(d.hi_p10 || d.hi_p50);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(198, 93, 53, 0.09)";
    ctx.fill();

    // Expected Trajectory Line (P50 in Burnt Orange)
    ctx.beginPath();
    ctx.strokeStyle = "#C65D35";
    ctx.lineWidth = 2.5;
    trajectory.forEach((d, i) => {
      const x = getX(d.month_offset);
      const y = getY(d.hi_p50);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Point markers on P50
    trajectory.forEach((d, i) => {
      if (i % 2 === 0 || i === trajectory.length - 1) {
        const x = getX(d.month_offset);
        const y = getY(d.hi_p50);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#C65D35";
        ctx.fill();
      }
    });

    // X Axis Months
    ctx.textAlign = "center";
    ctx.fillStyle = "#77796F";
    ctx.font = "10px 'JetBrains Mono', monospace";
    trajectory.forEach((d, i) => {
      if (i % 2 === 0 || i === trajectory.length - 1) {
        ctx.fillText(`+${d.month_offset}m`, getX(d.month_offset), height - padBottom + 16);
      }
    });
  }

  // 4. Lifecycle Cash Outflow Bar Chart (Conventional vs AI-PdM)
  function renderCashflowComparisonChart(canvasId, convSchedule, pdmSchedule) {
    const canvas = document.getElementById(canvasId);
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    const padLeft = 70;
    const padRight = 24;
    const padTop = 28;
    const padBottom = 35;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const years = Math.min(convSchedule.length, pdmSchedule.length, 8);
    let maxCost = 0;
    for (let i = 0; i < years; i++) {
      maxCost = Math.max(maxCost, convSchedule[i].total_annual_cost, pdmSchedule[i].om_cost + pdmSchedule[i].risk_cost);
    }
    maxCost = Math.ceil(maxCost * 1.2 / 20000) * 20000;
    if (maxCost === 0) maxCost = 100000;

    // Grid lines & labels
    ctx.strokeStyle = "rgba(37, 39, 34, 0.08)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#77796F";
    ctx.textAlign = "right";

    for (let i = 0; i <= 4; i++) {
      const y = padTop + chartH - (i / 4) * chartH;
      const v = (i / 4) * maxCost;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      const label = v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${Math.round(v / 1000)}k`;
      ctx.fillText(label, padLeft - 8, y + 3);
    }

    const groupW = chartW / years;
    const barW = Math.max(8, groupW * 0.32);

    ctx.textAlign = "center";
    ctx.font = "10px 'JetBrains Mono', monospace";

    for (let i = 0; i < years; i++) {
      const groupX = padLeft + i * groupW + groupW / 2;
      
      // Conventional Bar (Muted Brick Red)
      const convCost = convSchedule[i].total_annual_cost;
      const convH = (convCost / maxCost) * chartH;
      const convX = groupX - barW - 2;
      const convY = padTop + chartH - convH;

      ctx.fillStyle = "#B8473C";
      ctx.fillRect(convX, convY, barW, convH);

      // AI-PdM Bar (Olive Green / Charcoal)
      const pdmCost = pdmSchedule[i].om_cost + pdmSchedule[i].risk_cost * 0.2;
      const pdmH = (pdmCost / maxCost) * chartH;
      const pdmX = groupX + 2;
      const pdmY = padTop + chartH - pdmH;

      ctx.fillStyle = "#777C54";
      ctx.fillRect(pdmX, pdmY, barW, pdmH);

      // Year Label
      ctx.fillStyle = "#77796F";
      ctx.fillText(`Y${i + 1}`, groupX, height - padBottom + 16);
    }
  }

  return {
    renderEUACChart: renderEUACChart,
    renderMarginalCostChart: renderMarginalCostChart,
    renderRULTrajectoryChart: renderRULTrajectoryChart,
    renderCashflowComparisonChart: renderCashflowComparisonChart
  };

})();
