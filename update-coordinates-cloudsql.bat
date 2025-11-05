@echo off
REM Cloud SQL에서 좌표 업데이트 (road_address → lat, lng)

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 좌표 업데이트
echo ============================================
echo.

echo 이 스크립트는 백엔드를 실행하여
echo road_address를 lat, lng로 변환합니다.
echo.
echo 백엔드가 Cloud SQL 프로파일로 실행되어야 합니다.
echo.

echo [1/3] 백엔드 연결 확인...
curl -s http://localhost:8080/api/restaurants/statistics/coordinates >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 백엔드가 실행되지 않았습니다!
    echo.
    echo 백엔드를 먼저 실행하세요:
    echo    quick-test-local-cloudsql.bat
    echo    또는
    echo    gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
    echo.
    pause
    exit /b 1
)
echo ✅ 백엔드 연결 성공
echo.

echo [2/3] 현재 좌표 통계 확인...
echo.
curl -s "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
echo.

echo [3/3] 배치 좌표 업데이트 시작...
echo    ⚠️  이 작업은 시간이 오래 걸릴 수 있습니다.
echo    ⚠️  진행 상황은 백엔드 로그를 확인하세요.
echo.
echo    딜레이 설정: 1500ms (1.5초)
echo.

set /p confirm="좌표 업데이트를 시작하시겠습니까? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1500"
echo.
echo.

echo ✅ 배치 업데이트 요청 완료!
echo.
echo 💡 진행 상황 확인:
echo    - 백엔드 콘솔 로그 확인
echo    - 10개마다 진행 상황 로그 출력
echo    - 완료 후 통계 확인:
echo      curl "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
pause

