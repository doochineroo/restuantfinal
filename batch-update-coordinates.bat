@echo off
REM 429 에러 방지 배치 좌표 업데이트 스크립트

chcp 65001 >nul
echo ============================================
echo    429 에러 방지 배치 좌표 업데이트
echo ============================================
echo.

echo 📋 배치 업데이트 시작...
echo    - 좌표가 없는 모든 식당 업데이트
echo    - API 키 로테이션으로 429 에러 방지
echo    - 적절한 딜레이로 안전한 호출
echo.

echo [1단계] 백엔드 연결 확인...
curl -s http://localhost:8080/api/restaurants/statistics/coordinates >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 백엔드가 실행되지 않았습니다!
    echo    먼저 'gradlew.bat bootRun'을 실행하세요.
    pause
    exit /b 1
)
echo ✅ 백엔드 연결 성공
echo.

echo [2단계] 현재 좌표 통계 확인...
echo.
curl -s "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
echo.

echo [3단계] 배치 좌표 업데이트 시작...
echo    ⚠️  이 작업은 시간이 오래 걸릴 수 있습니다.
echo    ⚠️  진행 상황은 백엔드 로그를 확인하세요.
echo.
echo    딜레이 설정: 1500ms (1.5초)
echo    (더 느리게 하려면: delayMs=2000 등으로 조정)
echo.

curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1500"
echo.
echo.

echo [4단계] 업데이트 후 통계 확인...
echo.
curl -s "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
echo.

echo ✅ 배치 업데이트 요청 완료!
echo.
echo 💡 진행 상황 확인:
echo    - 백엔드 콘솔 로그 확인
echo    - 10개마다 진행 상황 로그 출력
echo    - 완료되면 위 통계에서 확인 가능
echo.
pause





