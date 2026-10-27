@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  TYRZ Lab — Ferrari F40 Telemetry  |  Startup Script  (Windows CMD)
REM  Usage:  Double-click start.bat  OR  run it from a terminal
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo   TYRZ Lab -- Ferrari F40 Telemetry
echo   -----------------------------------
echo.

REM Guard: Node.js must be installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM server-mongodb.js has no external npm deps beyond node built-ins + optional mongodb
REM The mongodb package lives in the root node_modules
if not exist "%~dp0node_modules" (
    echo   Warning: node_modules missing. Installing root dependencies...
    cd /d "%~dp0"
    npm install
    echo   Dependencies installed.
)

echo   Starting server-mongodb.js on port 5000...
echo.
start "TYRZ Server" cmd /k "cd /d "%~dp0" && node server-mongodb.js"

echo   Waiting for server to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo   Opening app in browser...
start "" "http://localhost:5000/login.html"

echo.
echo   --------------------------------------------------
echo   App URL  : http://localhost:5000
echo   Login    : http://localhost:5000/login.html
echo   Health   : http://localhost:5000/api/health
echo   Stop     : Close the "TYRZ Server" window
echo   --------------------------------------------------
echo.
pause
