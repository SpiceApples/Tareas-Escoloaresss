@echo off
setlocal
cd /d "%~dp0"

echo Starting backend and frontend in new windows...
call "%~dp0run-backend.cmd"
call "%~dp0run-frontend.cmd"

echo If nothing opens, run these manually:
echo   Backend:  node src\app.js
echo   Frontend: cd frontend ^&^& npm run dev
pause
