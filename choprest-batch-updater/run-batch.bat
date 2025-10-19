@echo off
echo Starting ChopRest Batch Location Updater...
echo.

REM Gradle wrapper 실행 권한 부여
if not exist gradlew.bat (
    echo Creating gradlew.bat...
    echo @echo off > gradlew.bat
    echo gradle %* >> gradlew.bat
)

echo Building the project...
call gradlew.bat build

if %ERRORLEVEL% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting the batch updater...
echo The application will run on port 8081
echo You can access the API at: http://localhost:8081/api/batch/status
echo.

call gradlew.bat bootRun

pause
