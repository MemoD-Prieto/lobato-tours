@echo off
REM Database initialization script for Windows (Batch)
REM This script initializes the database schema on a fresh database

echo 🚀 Initializing database schema...
echo.

REM Wait for the app to be ready
echo ⏳ Waiting for application to be ready...
set MAX_RETRIES=30
set RETRY_COUNT=0
set APP_READY=0

:wait_loop
if %RETRY_COUNT% GEQ %MAX_RETRIES% goto timeout
set /a RETRY_COUNT+=1

REM Try to connect to the API
curl -s -f http://localhost:3001/api/init-simple >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Application is ready!
    set APP_READY=1
    goto init_db
)

echo    Attempt %RETRY_COUNT%/%MAX_RETRIES%...
timeout /t 2 /nobreak >nul
goto wait_loop

:timeout
if %APP_READY% EQU 0 (
    echo ❌ Application did not become ready in time
    exit /b 1
)

:init_db
echo 📊 Initializing database schema...
curl -X POST http://localhost:3001/api/init-simple > temp_response.json 2>nul

REM Check if response contains "ok":true
findstr /C:"\"ok\":true" temp_response.json >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database initialized successfully!
    echo.
    echo 📝 Default admin credentials:
    echo    Username: admin
    echo    Password: admin123
    echo.
    echo 🌐 Application is ready at: http://localhost:3001
    del temp_response.json >nul 2>&1
) else (
    echo ❌ Database initialization failed:
    type temp_response.json
    del temp_response.json >nul 2>&1
    exit /b 1
)

