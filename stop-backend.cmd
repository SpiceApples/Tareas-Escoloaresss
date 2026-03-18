@echo off
setlocal
cd /d "%~dp0"

echo Stopping backend listening on port 3000...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr :3000') do (
  if not "%%P"=="" taskkill /PID %%P /F >nul 2>nul
)
echo Done.
