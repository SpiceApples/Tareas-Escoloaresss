@echo off
setlocal
cd /d "%~dp0"

echo Starting backend (node src\app.js) in a new window...
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found in PATH.
  echo Install Node.js or reopen your terminal after install.
  pause
  exit /b 1
)
start "tareas-backend" /D "%~dp0" cmd /k "node src\app.js"
