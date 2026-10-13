# PowerShell script to run all 4 sites/services in parallel
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Retail Pulse Multi-Source Intelligence Suite" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " [1] Connector Backend: http://localhost:5000" -ForegroundColor Magenta
Write-Host " [2] ShopPulse Store:   http://localhost:3000" -ForegroundColor Blue
Write-Host " [3] TechMart Store:    http://localhost:5174" -ForegroundColor Cyan
Write-Host " [4] RetailPulse App:   http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

npx -y concurrently --kill-others `
  -n "connector,shoppulse,techmart,retailpulse" `
  -c "magenta,blue,cyan,green" `
  "npm --prefix retail-pulse-connector run dev" `
  "npm --prefix Site1 run dev" `
  "npm --prefix TechMart run dev" `
  "npm --prefix RetailPulse run dev"
