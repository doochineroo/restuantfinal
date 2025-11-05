@echo off
REM 좌표 업데이트 테스트 스크립트

chcp 65001 >nul
echo ============================================
echo    좌표 업데이트 테스트
echo ============================================
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

echo [3단계] 프록시 API 테스트 (맥도날드 검색)...
echo.
curl -s "http://localhost:8080/api/restaurants/kakao/search?query=맥도날드%20강남" | findstr /C:"x" /C:"y" /C:"road_address"
echo.
echo.

echo [4단계] 식당 검색으로 자동 좌표 업데이트 테스트...
echo    (좌표가 없는 식당은 자동으로 업데이트됩니다)
echo.
curl -s "http://localhost:8080/api/restaurants/search?keyword=맥도날드" >nul
echo    검색 완료 (자동 업데이트됨)
echo.

echo [5단계] 업데이트 후 통계 확인...
echo.
curl -s "http://localhost:8080/api/restaurants/statistics/coordinates"
echo.
echo.

echo ✅ 테스트 완료!
echo.
echo 💡 DBeaver에서 확인:
echo    1. restaurants 테이블 열기
echo    2. lat, lng, road_address 컬럼 확인
echo.
pause





