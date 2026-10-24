"""
FastAPI Application for Asset Replacement Decision Support Tool using AI & EEFM.
Serves REST API endpoints for AI prognostics, Engineering Economics (EUAC/LCC),
telemetry simulation, and serves the interactive UI frontend.
"""

import json
import os
import random
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from models.asset_data import ASSET_PRESETS
from models.pdm_ai_engine import PdMAIEngine
from models.eefm_engine import EEFMEngine

app = FastAPI(
    title="AI Asset Replacement Decision Support System",
    description="EEFM Decision Support System integrating real-time sensor prognostics with Equivalent Uniform Annual Cost (EUAC) replacement models.",
    version="2.0.0"
)

# Models for Request Bodies
class EvaluationRequest(BaseModel):
    asset_id: str
    telemetry: Dict[str, float]
    marr: float = Field(default=0.10, ge=0.01, le=0.40)
    unplanned_failure_cost: Optional[float] = None
    degradation_scenario: str = "actual"

class StreamSimulateRequest(BaseModel):
    asset_id: str
    base_telemetry: Dict[str, float]
    noise_level: float = 0.05
    trend_direction: str = "none"  # "none", "degrading", "improving"

# Load Pre-configured Scenarios
SCENARIOS_PATH = os.path.join(os.path.dirname(__file__), "data", "sample_telemetry.json")
try:
    with open(SCENARIOS_PATH, "r", encoding="utf-8") as f:
        SCENARIOS_DATA = json.load(f).get("scenarios", [])
except Exception:
    SCENARIOS_DATA = []

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": "AI-EEFM Asset Replacement Tool", "version": "2.0.0"}

@app.get("/api/assets")
async def get_assets():
    """Returns list of asset archetypes with high-level parameters."""
    assets_summary = []
    for k, v in ASSET_PRESETS.items():
        assets_summary.append({
            "id": v["id"],
            "name": v["name"],
            "category": v["category"],
            "criticality": v["criticality"],
            "capital_cost": v["initial_capital_cost"],
            "current_age_years": v["current_age_years"],
            "design_life_years": v["expected_design_life"],
            "sensor_count": len(v["sensors"]),
            "challenger_name": v["challenger"]["name"]
        })
    return assets_summary

@app.get("/api/assets/{asset_id}")
async def get_asset_detail(asset_id: str):
    """Returns detailed specification and sensors for a selected asset."""
    if asset_id not in ASSET_PRESETS:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found.")
    return ASSET_PRESETS[asset_id]

@app.get("/api/scenarios")
async def get_scenarios():
    """Returns list of degradation telemetry scenarios."""
    return SCENARIOS_DATA

@app.post("/api/evaluate")
async def evaluate_asset_replacement(req: EvaluationRequest):
    """
    Main EEFM & AI decision evaluation endpoint.
    Computes AI Health Index, RUL, Weibull failure risk,
    Conventional vs PdM economic models, EUAC curves, and Marginal Cost crossover.
    """
    if req.asset_id not in ASSET_PRESETS:
        raise HTTPException(status_code=404, detail=f"Asset '{req.asset_id}' not found.")
    
    asset = ASSET_PRESETS[req.asset_id]
    result = EEFMEngine.evaluate_replacement_economics(
        asset_profile=asset,
        telemetry=req.telemetry,
        marr=req.marr,
        unplanned_failure_cost=req.unplanned_failure_cost,
        degradation_scenario=req.degradation_scenario
    )
    return result

@app.post("/api/simulate-telemetry-stream")
async def simulate_telemetry_stream(req: StreamSimulateRequest):
    """
    Simulates real-time sensor fluctuation for live telemetry monitoring dashboard.
    Adds physical Gaussian noise and trend drift.
    """
    if req.asset_id not in ASSET_PRESETS:
        raise HTTPException(status_code=404, detail=f"Asset '{req.asset_id}' not found.")
    
    asset = ASSET_PRESETS[req.asset_id]
    sensors = asset["sensors"]
    new_telemetry = {}

    for k, spec in sensors.items():
        base = req.base_telemetry.get(k, spec["baseline"])
        # Add random noise
        noise = (random.gauss(0, 1) * req.noise_level) * (spec["warning"] - spec["baseline"]) * 0.1
        # Add trend if degrading
        drift = 0.0
        if req.trend_direction == "degrading":
            drift = 0.03 * (spec["critical"] - spec["baseline"])
        elif req.trend_direction == "improving":
            drift = -0.02 * (spec["critical"] - spec["baseline"])
            
        val = max(0.0, base + noise + drift)
        new_telemetry[k] = round(val, 2)

    # Recompute Health Index on this streamed tick
    hi_data = PdMAIEngine.calculate_health_index(asset, new_telemetry)

    return {
        "telemetry": new_telemetry,
        "health_index": hi_data["health_index"],
        "status": hi_data["status"],
        "status_color": hi_data["status_color"]
    }

# Mount static files directories
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    css_dir = os.path.join(STATIC_DIR, "css")
    js_dir = os.path.join(STATIC_DIR, "js")
    if os.path.isdir(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")
    if os.path.isdir(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
async def serve_index():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    return {"message": "Static index.html not yet initialized"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
