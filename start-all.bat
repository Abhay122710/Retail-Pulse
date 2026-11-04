@echo off
title Retail Pulse Suite Launcher
echo ========================================================
echo   Starting Retail Pulse Multi-Source Intelligence Suite
echo ========================================================
echo  [1] Python ML Service:  http://localhost:8000
echo  [2] Connector Gateway:  http://localhost:5000
echo  [3] ShopPulse Store:    http://localhost:3000
echo  [4] TechMart Store:     http://localhost:5174
echo  [5] RetailPulse App:    http://localhost:5173
echo ========================================================
echo.

npx -y concurrently --kill-others -n "ml,connector,shoppulse,techmart,retailpulse" -c "yellow,magenta,blue,cyan,green" ".\retailpulse-ml\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir retailpulse-ml --host 127.0.0.1 --port 8000" "npm --prefix retail-pulse-connector run dev" "npm --prefix Site1 run dev" "npm --prefix TechMart run dev" "npm --prefix RetailPulse run dev"
pause

