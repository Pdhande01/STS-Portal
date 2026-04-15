@echo off
echo ================================
echo Smart Tech Service Portal Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Installing React...
call npm install react@18.3.1 react-dom@18.3.1

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install React
    pause
    exit /b 1
)

echo.
echo ================================
echo Installation complete!
echo ================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo.
pause
