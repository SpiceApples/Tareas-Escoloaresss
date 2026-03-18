@echo off
setlocal
cd /d "%~dp0"

echo Starting frontend (npm run dev) in a new window...
where npm >nul 2>nul
if errorlevel 1 (
  echo npm not found in PATH.
  echo Install Node.js or reopen your terminal after install.
  pause
  exit /b 1
)
start "tareas-frontend" /D "%~dp0frontend" cmd /k "npm run dev"
