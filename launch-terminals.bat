@echo off
title Retail Pulse - Separate Windows Launcher
echo Starting all services in dedicated terminal windows...

cd /d "%~dp0"

start "Retail Pulse Connector [Port 5000]" /d "%~dp0retail-pulse-connector" cmd /k "npm run dev"
ping 127.0.0.1 -n 2 >nul

start "ShopPulse Store [Port 3000]" /d "%~dp0Site1" cmd /k "npm run dev"
ping 127.0.0.1 -n 2 >nul

start "TechMart Store [Port 5174]" /d "%~dp0TechMart" cmd /k "npm run dev"
ping 127.0.0.1 -n 2 >nul

start "RetailPulse BI Dashboard [Port 5173]" /d "%~dp0RetailPulse" cmd /k "npm run dev"

echo All 4 windows launched!

