@echo off
echo ============================================
echo   Connected Commerce - Partner Service
echo ============================================
echo.
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven is not installed. Run: winget install Apache.Maven
    echo Then restart this command prompt.
    pause
    exit /b 1
)
echo Starting Partner Service on port 8082...
echo Test at: http://localhost:8082/api/v1/partners/health
echo.
mvn spring-boot:run
