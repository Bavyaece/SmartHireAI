@echo off
title SmartHire AI Server
cd /d "%~dp0"

echo.
echo  SmartHire AI - Full App
echo  =======================
echo.

cd /d "%~dp0backend"
if not exist ".env" (
  if exist ".env.example" copy ".env.example" ".env" >nul
)

python -m pip install -r requirements.txt -q
echo.
echo  Open in browser:  http://localhost:8000
echo  Press Ctrl+C to stop
echo.

python run.py
pause
