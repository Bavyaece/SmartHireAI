@echo off
echo Starting SmartHire AI (Backend + Frontend)...
cd /d "%~dp0backend"
if not exist ".env" copy .env.example .env >nul 2>&1
python -m pip install -r requirements.txt -q
echo.
echo Server: http://localhost:8000
echo Press Ctrl+C to stop
python run.py
