@echo off
REM bootRun 후 테스트 스크립트

chcp 65001 >nul
echo ============================================
echo    백엔드 재시작 후 테스트
echo ============================================
echo.

echo [1단계] 백엔드 연결 확인...
curl -s http://localhost:8080/api/restaurants/statistics/coordinates >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 백엔드가 아직 준비되지 않았습니다.
    echo    잠시 기다린 후 다시 시도하세요.
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

echo [3단계] Kakao API 테스트 (맥도날드 검색)...
echo.
curl -s "http://localhost:8080/api/restaurants/kakao/search?query=%EB%A7%A5%EB%8F%84%EB%82%A0%EB%93%9C" | findstr /C:"x" /C:"y" /C:"road_address" /C:"error" /C:"documents"
echo.
echo.

echo [4단계] 식당 검색으로 자동 좌표 업데이트 테스트...
echo.
curl -s "http://localhost:8080/api/restaurants/search?keyword=맥도날드" >nul
echo    검색 완료 (좌표가 없으면 자동으로 업데이트됩니다)
echo.

echo [5단계] 업데이트 후 통계 확인...
echo.
curl -s "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
echo.

echo ============================================
echo    다음 단계
echo ============================================
echo.
echo 💡 모든 식당 좌표를 한번에 업데이트하려면:
echo    curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1500"
echo.
echo 💡 또는 배치 스크립트 실행:
echo    batch-update-coordinates.bat
echo.
echo.

pause

