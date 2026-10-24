/**
 * Interactive Canvas-based Chart Rendering Engine for EEFM Decision Tool.
 * Provides high-DPI rendering, anti-aliased curves, glowing accents, and tooltips.
 */

const EEFMCharts = (function() {

  // Helper to setup retina-sharp canvas
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

    const padLeft = 65;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;
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
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
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
    schedule.forEach((d, i) => {
      const x = getX(i);
      ctx.fillText(`Yr ${d.keep_years}`, x, height - padBottom + 18);
    });

    // Helper to draw smooth series
    function drawSeries(key, color, strokeWidth = 2, dashed = false) {
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

      // Draw point markers
      schedule.forEach((d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        ctx.beginPath();
        ctx.arc(x, y, strokeWidth > 2 ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#070b14";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Draw individual components
    drawSeries("capital_recovery_cr", "rgba(59, 130, 246, 0.75)", 1.5, true);  // Blue: CR
    drawSeries("annualized_om", "rgba(16, 185, 129, 0.75)", 1.5, true);        // Green: O&M
    drawSeries("annualized_risk", "rgba(239, 68, 68, 0.75)", 1.5, true);      // Red: Risk

    // Draw Total EUAC curve (Dominant Glowing Cyan)
    ctx.shadowColor = "rgba(0, 242, 254, 0.5)";
    ctx.shadowBlur = 8;
    drawSeries("total_euac", "#00f2fe", 3.2, false);
    ctx.shadowBlur = 0;

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
    ctx.arc(optX, optY, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#00f2fe";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(optX, optY, 11, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 242, 254, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00f2fe";
    ctx.font = "bold 10px 'Outfit', sans-serif";
    ctx.fillText(`Min EUAC: $${minVal.toLocaleString()}`, optX, optY - 14);
  }

  // 2. Marginal Cost (Defender) vs Challenger EUAC Chart
  function renderMarginalCostChart(canvasId, schedule, challengerEUAC, crossoverYear) {
    const canvas = document.getElementById(canvasId);
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);
    if (!schedule || schedule.length === 0) return;

    const padLeft = 65;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    let maxVal = Math.max(challengerEUAC * 1.3, ...schedule.map(d => d.marginal_cost));
    maxVal = Math.ceil(maxVal * 1.1 / 10000) * 10000;
    if (maxVal === 0) maxVal = 100000;

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
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
    schedule.forEach((d, i) => {
      ctx.fillText(`Yr ${d.keep_years}`, getX(i), height - padBottom + 18);
    });

    // Horizontal Challenger EUAC line (Gold / Amber dashed)
    const challY = getY(challengerEUAC);
    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.moveTo(padLeft, challY);
    ctx.lineTo(width - padRight, challY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Challenger Min EUAC: $${challengerEUAC.toLocaleString()}`, width - padRight, challY - 8);

    // Defender Marginal Cost Line (Cyan rising to Ruby)
    const grad = ctx.createLinearGradient(padLeft, 0, width - padRight, 0);
    grad.addColorStop(0, "#00f2fe");
    grad.addColorStop(0.6, "#f59e0b");
    grad.addColorStop(1, "#ef4444");

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
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
      ctx.fillStyle = isBreached ? "#ef4444" : "#00f2fe";
      ctx.fill();
      ctx.strokeStyle = "#070b14";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Mark Crossover Point
    if (crossoverYear !== null && crossoverYear <= schedule.length) {
      const crossIdx = crossoverYear - 1;
      const crossX = getX(crossIdx);
      const crossY = getY(schedule[crossIdx].marginal_cost);

      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(crossX, padTop);
      ctx.lineTo(crossX, height - padBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 10px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`REPLACE CROSSOVER`, crossX, padTop - 10);
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

    const padLeft = 50;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 35;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const maxM = trajectory[trajectory.length - 1].month_offset || 24;

    function getX(m) { return padLeft + (m / maxM) * chartW; }
    function getY(hi) { return padTop + chartH - (hi / 100.0) * chartH; }

    // Grid lines for HI (0 to 100%)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";

    [0, 20, 50, 75, 100].forEach(hi => {
      const y = getY(hi);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(`${hi}%`, padLeft - 8, y + 3);
    });

    // Critical Threshold Line at 20%
    const threshY = getY(failureThreshold);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padLeft, threshY);
    ctx.lineTo(width - padRight, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444";
    ctx.textAlign = "right";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText("Failure Boundary (20%)", width - padRight, threshY - 6);

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
    ctx.fillStyle = "rgba(0, 242, 254, 0.12)";
    ctx.fill();

    // Expected Trajectory Line (P50)
    ctx.beginPath();
    ctx.strokeStyle = "#00f2fe";
    ctx.lineWidth = 2.5;
    trajectory.forEach((d, i) => {
      const x = getX(d.month_offset);
      const y = getY(d.hi_p50);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // X Axis Months
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
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

    const padLeft = 65;
    const padRight = 20;
    const padTop = 25;
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

    // Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
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
    const barW = Math.max(8, groupW * 0.35);

    ctx.textAlign = "center";

    for (let i = 0; i < years; i++) {
      const groupX = padLeft + i * groupW + groupW / 2;
      
      // Conventional Bar (Muted Red/Slate)
      const convCost = convSchedule[i].total_annual_cost;
      const convH = (convCost / maxCost) * chartH;
      const convX = groupX - barW - 2;
      const convY = padTop + chartH - convH;

      ctx.fillStyle = "rgba(239, 68, 68, 0.65)";
      ctx.fillRect(convX, convY, barW, convH);

      // AI-PdM Bar (Cyan/Emerald)
      const pdmCost = pdmSchedule[i].om_cost + pdmSchedule[i].risk_cost * 0.2;
      const pdmH = (pdmCost / maxCost) * chartH;
      const pdmX = groupX + 2;
      const pdmY = padTop + chartH - pdmH;

      ctx.fillStyle = "#00f2fe";
      ctx.fillRect(pdmX, pdmY, barW, pdmH);

      // Label
      ctx.fillStyle = "#64748b";
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
