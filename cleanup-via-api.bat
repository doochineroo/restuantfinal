@echo off
REM API를 사용한 삭제 스크립트 (비밀번호 문제 없음)

chcp 65001 >nul
echo ============================================
echo    API를 통한 좌표 없는 레스토랑 삭제
echo ============================================
echo.
echo 이 방법은 MySQL 비밀번호 문제 없이 작동합니다.
echo.

set API_URL=http://localhost:8080

echo 1. 백엔드 서버가 실행 중인지 확인...
curl -s %API_URL%/api/restaurants/statistics/coordinates >nul 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 백엔드 서버에 연결할 수 없습니다.
    echo.
    echo 다음 명령어로 백엔드를 실행하세요:
    echo    gradlew.bat bootRun
    echo.
    echo 또는 다른 터미널에서 백엔드를 실행한 후 다시 시도하세요.
    pause
    exit /b 1
)

echo ✅ 백엔드 서버 연결 확인!
echo.

echo 2. 현재 통계 확인...
echo.
curl -s %API_URL%/api/restaurants/statistics/coordinates
echo.
echo.

echo 3. 삭제 확인...
echo 정말로 좌표가 없는 레스토랑을 삭제하시겠습니까? (Y/N)
set /p "confirm=> "

if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 4. 삭제 실행 중...
curl -X DELETE %API_URL%/api/restaurants/cleanup/without-coordinates

echo.
echo.
echo ✅ 완료!
echo.

pause





