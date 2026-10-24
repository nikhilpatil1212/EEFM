@echo off
title AI Asset Replacement Decision Support System (EEFM)
echo =====================================================================
echo   AI-Driven Asset Replacement Decision Support Tool
echo   Engineering Economics & Financial Management (EEFM)
echo =====================================================================
echo Starting FastAPI server at http://127.0.0.1:8000 ...
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
pause
