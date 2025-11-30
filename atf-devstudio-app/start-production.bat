@echo off

REM === ATF Dev Studio - Production Server ===

cd /d D:\2025_WORK\Projects\vibecoding\cursor\atf-devstudio-app

echo Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Exiting...
    pause
    exit /b 1
)

echo.
echo Starting production server on port 4500...
echo Frontend and Backend will be available at http://localhost:4500
echo.

set PORT=4500
set NODE_ENV=production
start cmd /k "node server/index.js"

timeout /t 3 /nobreak >nul
echo.
echo Server started! Opening browser...
start http://localhost:4500



