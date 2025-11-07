@echo off
echo Starting SAP Data Validator Backend Server...
echo.

REM Kill any existing Node.js processes on port 3002
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    echo Killing process %%a on port 3002
    taskkill /PID %%a /F >nul 2>&1
)

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start the server
echo Starting server on port 3002...
node index.js

pause


