@echo off
echo ============================================
echo   Connected Commerce - Offer Service
echo ============================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH.
    echo Please install Java from https://adoptium.net/
    echo Make sure to check "Set JAVA_HOME" during installation.
    pause
    exit /b 1
)

REM Check if Maven is available
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven is not installed. Installing via winget...
    echo.
    winget install Apache.Maven
    echo.
    echo Please RESTART this command prompt after installation, then run this script again.
    pause
    exit /b 1
)

echo Starting Offer Service on port 8081...
echo Press Ctrl+C to stop.
echo.
echo Once started, test at: http://localhost:8081/api/v1/offers/health
echo.

mvn spring-boot:run
