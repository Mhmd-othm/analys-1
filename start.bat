@echo off
setlocal
title Analys 1 (MA1499) App
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm was not found in PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo Starting Analys 1 (MA1499) in your default browser...
echo Keep this window open while using the app. Press Ctrl+C or close this window to stop.
echo.
call npm run dev -- --open
if errorlevel 1 (
    echo.
    echo [ERROR] Application exited with an error.
    pause
    exit /b 1
)
