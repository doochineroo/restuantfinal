@echo off
REM restaurant_code 업데이트 및 CSV 데이터 로드

chcp 65001 >nul
echo ============================================
echo    식당 데이터 업데이트
echo ============================================
echo.
echo 이 작업은:
echo   1. 백엔드를 실행합니다
echo   2. CSV에서 처음 500개를 로드합니다
echo   3. restaurant_code 기준으로 중복 체크하여 추가합니다
echo.
echo ⚠️  포트 8080이 사용 중이면 먼저 종료하세요
echo    (kill-port-8080.bat 실행)
echo.
pause

cd /d "%~dp0"

echo.
echo 백엔드를 실행합니다...
echo Ctrl+C로 중지할 수 있습니다.
echo.
echo 로그에서 다음을 확인하세요:
echo   - "Loading restaurants from CSV and checking duplicates by restaurant_code..."
echo   - "Successfully loaded X new restaurants from CSV"
echo.
pause

call gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'

pause

