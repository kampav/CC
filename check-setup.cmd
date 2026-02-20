@echo off
echo ============================================================
echo   Connected Commerce Platform - Setup Verification
echo ============================================================
echo.
echo This script checks if everything you need is installed.
echo.

set ERRORS=0

echo [1/5] Checking Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo   MISSING - Install from https://adoptium.net/
    echo   Check "Set JAVA_HOME" during installation.
    set /a ERRORS+=1
) else (
    echo   OK
)

echo [2/5] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo   MISSING - Install from https://nodejs.org/
    set /a ERRORS+=1
) else (
    echo   OK
)

echo [3/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   MISSING - Install Docker Desktop from https://docker.com/products/docker-desktop/
    set /a ERRORS+=1
) else (
    echo   OK
)

echo [4/5] Checking Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo   MISSING - Comes with Docker Desktop. Reinstall Docker Desktop.
    set /a ERRORS+=1
) else (
    echo   OK
)

echo [5/5] Checking Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   MISSING - Install from https://git-scm.com/download/win
    set /a ERRORS+=1
) else (
    echo   OK
)

echo.
echo ============================================================

if %ERRORS% gtr 0 (
    echo   %ERRORS% tool(s) missing. Please install them first.
    echo   After installing, RESTART PowerShell and run this again.
) else (
    echo   ALL TOOLS INSTALLED - You're ready to go!
    echo.
    echo   Next steps:
    echo   1. Make sure Docker Desktop is running (green icon in system tray)
    echo   2. Run: docker compose up -d
    echo   3. Wait 15 seconds
    echo   4. Run: docker compose ps (should show 3 running containers)
    echo   5. Install Maven: winget install Apache.Maven
    echo   6. Start building! See docs\context\CONTEXT.md for instructions.
)

echo ============================================================
echo.
pause
