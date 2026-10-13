@echo off
title Retail Pulse Suite Launcher
echo ========================================================
echo   Starting Retail Pulse Multi-Source Intelligence Suite
echo ========================================================
echo  [1] Connector Backend: http://localhost:5000
echo  [2] ShopPulse Store:   http://localhost:3000
echo  [3] TechMart Store:    http://localhost:5174
echo  [4] RetailPulse App:   http://localhost:5173
echo ========================================================
echo.

npx -y concurrently --kill-others -n "connector,shoppulse,techmart,retailpulse" -c "magenta,blue,cyan,green" "npm --prefix retail-pulse-connector run dev" "npm --prefix Site1 run dev" "npm --prefix TechMart run dev" "npm --prefix RetailPulse run dev"
pause
