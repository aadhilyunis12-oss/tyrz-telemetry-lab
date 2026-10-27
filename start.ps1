# ─────────────────────────────────────────────────────────────────────────────
#  TYRZ Lab — Ferrari F40 Telemetry  |  Startup Script  (Windows PowerShell)
#  Usage:  .\start.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BACKEND_PORT = 5000

Write-Host ""
Write-Host "  🏎  TYRZ Lab — Ferrari F40 Telemetry" -ForegroundColor Red
Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkRed
Write-Host ""

# Guard: Node.js must be installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  ❌  Node.js not found. Install it from https://nodejs.org" -ForegroundColor Red
    exit 1
}
$nodeVer = node --version
Write-Host "  ✅  Node.js $nodeVer detected" -ForegroundColor Green

# Guard: node_modules must exist (root package)
if (-not (Test-Path (Join-Path $ROOT "node_modules"))) {
    Write-Host ""
    Write-Host "  ⚠️   node_modules is missing. Installing dependencies..." -ForegroundColor Yellow
    Push-Location $ROOT
    npm install
    Pop-Location
    Write-Host "  ✅  Dependencies installed." -ForegroundColor Green
}

# Guard: Kill any process already using port 5000
$portLines = netstat -ano | Select-String ":5000 "
$existing = $portLines | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Where-Object { $_ -match '^\d+$' } | Select-Object -Unique

if ($existing) {
    Write-Host ""
    Write-Host "  ⚠️   Port 5000 is already in use (PID: $($existing -join ', '))." -ForegroundColor Yellow
    Write-Host "       Server may already be running — open: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "       To restart, kill the PID first:" -ForegroundColor Yellow
    Write-Host "         Stop-Process -Id $($existing -join ',') -Force" -ForegroundColor DarkGray
    Write-Host ""
    $answer = Read-Host "  Continue anyway? [y/N]"
    if ($answer -notmatch '^[yY]') { exit 0 }
}

# Launch backend server
Write-Host ""
Write-Host "  🚀  Starting full server (port $BACKEND_PORT)..." -ForegroundColor Cyan

Start-Process -FilePath "node" `
    -ArgumentList "server-mongodb.js" `
    -WorkingDirectory $ROOT `
    -WindowStyle Normal

# Wait for health check
Write-Host "  ⏳  Waiting for backend to become ready..." -ForegroundColor Yellow
$maxAttempts = 15
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    $attempt++
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/api/health" `
            -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch { }
    Write-Host "    ... attempt $attempt/$maxAttempts" -ForegroundColor DarkGray
}

if ($ready) {
    Write-Host ""
    Write-Host "  ✅  Backend is LIVE at http://localhost:$BACKEND_PORT" -ForegroundColor Green
    Write-Host "  ✅  Health check:  http://localhost:$BACKEND_PORT/api/health" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  ❌  Backend did not become ready in time." -ForegroundColor Red
    Write-Host "      Check the Node.js window for error messages." -ForegroundColor Yellow
    Write-Host "      Common causes:" -ForegroundColor Yellow
    Write-Host "        • Missing backend\node_modules  ->  cd backend; npm install" -ForegroundColor DarkGray
    Write-Host "        • Port 5000 already taken       ->  netstat -ano | findstr :5000" -ForegroundColor DarkGray
    exit 1
}

# Open the app in browser
Write-Host ""
Write-Host "  🌐  Opening app in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:$BACKEND_PORT/login.html"

Write-Host "  ℹ️   Tip: You can also run:  cd backend; node server.js" -ForegroundColor DarkGray
Write-Host "       (Express-only API mode, no static file serving)" -ForegroundColor DarkGray

Write-Host ""
Write-Host "  ──────────────────────────────────────────────────" -ForegroundColor DarkRed
Write-Host "  App URL  : http://localhost:$BACKEND_PORT" -ForegroundColor White
Write-Host "  Login    : http://localhost:$BACKEND_PORT/login.html" -ForegroundColor White
Write-Host "  Health   : http://localhost:$BACKEND_PORT/api/health" -ForegroundColor White
Write-Host "  Stop     : Close the Node.js window, or press Ctrl+C in it" -ForegroundColor DarkGray
Write-Host "  ──────────────────────────────────────────────────" -ForegroundColor DarkRed
Write-Host ""
