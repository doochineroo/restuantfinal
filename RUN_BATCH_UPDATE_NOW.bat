@echo off
REM 좌표가 없는 모든 식당 업데이트 실행

chcp 65001 >nul
echo ============================================
echo    배치 좌표 업데이트 시작
echo ============================================
echo.

echo 📊 현재 상태:
echo    - 총 식당: 999개
echo    - 좌표 없는 식당: 999개
echo    - 좌표 있는 식당: 0개
echo.

echo ⚠️  주의사항:
echo    - 이 작업은 시간이 오래 걸립니다 (약 25-30분)
echo    - API 호출 제한을 고려하여 1.5초 간격으로 실행됩니다
echo    - 진행 상황은 백엔드 콘솔 로그를 확인하세요
echo.

set /p confirm="계속하시겠습니까? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b
)

echo.
echo [배치 업데이트 시작...]
echo.

curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1500"

echo.
echo.
echo ✅ 배치 업데이트 요청 완료!
echo.
echo 💡 진행 상황 확인:
echo    1. 백엔드 콘솔 로그에서 진행 상황 확인
echo    2. 10개마다 진행 상황 로그 출력
echo    3. 완료 후 다음 명령어로 결과 확인:
echo       curl "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
pause





