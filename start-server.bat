@echo off
echo Starting backend server...
cd /d "c:\Users\hp\Desktop\anas_law_website\backend"

echo.
echo Checking if node is installed...
node --version
if errorlevel 1 (
    echo Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking if npm is installed...
npm --version
if errorlevel 1 (
    echo npm is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install

echo.
echo Starting the server...
npm run dev
