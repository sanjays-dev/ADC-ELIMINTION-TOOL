@echo off
REM Setup script for JavaScript version (Windows)

echo 🚀 Setting up ADC Tool (JavaScript Version)...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install it from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%
echo.

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install Node.js from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    exit /b 1
)

echo ✓ Dependencies installed
echo.

echo ✅ Setup complete!
echo.
echo 🎯 Quick start:
echo    node cli.js scan .\src
echo    node cli.js report .\src
echo    node cli.js clean .\src
echo.
echo 🌐 Start API server:
echo    node server.js
echo.
