@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not available on PATH.
  echo Install Node.js 20+ and run this file again.
  pause
  exit /b 1
)
if not exist "public\react-build\index.html" (
  echo Building React client...
  call npm.cmd run build
)
echo.
echo ================================================
echo           MazaTowel Website
echo ================================================
echo.
echo Starting server at http://localhost:3000
echo Admin: http://localhost:3000/admin
echo.
node server.js
