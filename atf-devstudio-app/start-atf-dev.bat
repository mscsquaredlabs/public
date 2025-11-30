@echo off
cd /d D:\2025_WORK\Projects\vibecoding\cursor\atf-devstudio-app

REM Build the React app
call npm run build

REM Start the server in a new persistent window
start cmd /k "serve -s build -l 4500"
