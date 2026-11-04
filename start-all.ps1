# PowerShell script to run all 5 RetailPulse suite services in parallel
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Retail Pulse Multi-Source Intelligence Suite" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " [1] Python ML Service:  http://localhost:8000" -ForegroundColor Yellow
Write-Host " [2] Connector Gateway:  http://localhost:5000" -ForegroundColor Magenta
Write-Host " [3] ShopPulse Store:    http://localhost:3000" -ForegroundColor Blue
Write-Host " [4] TechMart Store:     http://localhost:5174" -ForegroundColor Cyan
Write-Host " [5] RetailPulse App:    http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

npx -y concurrently --kill-others `
  -n "ml,connector,shoppulse,techmart,retailpulse" `
  -c "yellow,magenta,blue,cyan,green" `
  ".\retailpulse-ml\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir retailpulse-ml --host 127.0.0.1 --port 8000" `
  "npm --prefix retail-pulse-connector run dev" `
  "npm --prefix Site1 run dev" `
  "npm --prefix TechMart run dev" `
  "npm --prefix RetailPulse run dev"

