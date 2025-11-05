@echo off
REM 전체 식당 좌표 업데이트 시작

chcp 65001 >nul
echo ============================================
echo    전체 식당 좌표 업데이트 시작
echo ============================================
echo.

echo 📊 현재 상태 확인...
echo.
curl -s "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
echo.

echo ⚠️  주의사항:
echo    - 이 작업은 시간이 오래 걸립니다
echo    - 999개 식당 기준 약 25-30분 소요 (1.5초 딜레이 기준)
echo    - 진행 상황은 백엔드 콘솔 로그에서 확인하세요
echo    - 10개마다 진행 상황 로그 출력
echo    - 429 에러 발생 시 자동 재시도 (30초 대기)
echo.
echo 💡 백엔드 콘솔 창을 함께 열어두시면 진행 상황을 실시간으로 볼 수 있습니다!
echo.

set /p confirm="전체 좌표 업데이트를 시작하시겠습니까? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b
)

echo.
echo [배치 업데이트 시작...]
echo    백엔드 콘솔에서 진행 상황을 확인하세요!
echo.

curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1500"

echo.
echo.
echo ✅ 배치 업데이트 요청 완료!
echo.
echo 📝 다음 단계:
echo    1. 백엔드 콘솔 로그 확인 (진행 상황 실시간 확인)
echo    2. 완료 후 결과 확인:
echo       curl "http://localhost:8080/api/restaurants/statistics/coordinates"
echo    3. 또는 브라우저에서:
echo       http://localhost:8080/api/restaurants/statistics/coordinates
echo.
echo 💡 팁: 백엔드 콘솔에서 다음과 같은 로그를 볼 수 있습니다:
echo    [INFO] Processing 1/999: 식당명
echo    [INFO] ✅ Successfully updated 1/999: 식당명
echo    [INFO] 📊 Progress: 10/999 (Success: 8, Failed: 1, Skipped: 1)
echo.
pause





