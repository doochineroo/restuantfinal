@echo off
REM 비밀번호 없이 실행되는 버전
REM MySQL root가 비밀번호 없이 설정된 경우 사용

setlocal enabledelayedexpansion
chcp 65001 >nul

echo ============================================
echo    좌표가 없는 레스토랑 삭제 (비밀번호 없음)
echo ============================================
echo.

cd /d "%~dp0"

set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=restaurant-demo
set DB_USER=root

REM MySQL 클라이언트 확인
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL 클라이언트를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo 1. 연결 테스트...
mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% -e "SELECT 'Connection OK' AS Status;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 연결 실패! 비밀번호가 필요합니다.
    echo.
    echo 다른 방법을 사용하세요:
    echo   1. cleanup-restaurants-simple.bat [비밀번호]
    echo   2. API 사용: curl -X DELETE http://localhost:8080/api/restaurants/cleanup/without-coordinates
    echo   3. MySQL Workbench나 DBeaver에서 cleanup-restaurants-without-coordinates.sql 실행
    pause
    exit /b 1
)

echo ✅ 연결 성공!
echo.

echo 2. 삭제 전 통계...
mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT COUNT(*) as total_restaurants, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;"

echo.
echo ============================================
echo ⚠️  주의: 이 작업은 되돌릴 수 없습니다!
echo ============================================
echo.
echo 정말로 좌표가 없는 레스토랑을 삭제하시겠습니까? (Y/N)
set /p "confirm=> "
if /i not "!confirm!"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 3. 삭제 실행...
mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "DELETE FROM restaurants WHERE lat IS NULL OR lng IS NULL;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ 삭제 완료!
    echo.
    echo 4. 삭제 후 확인...
    mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT COUNT(*) as remaining_restaurants, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;"
    echo.
    echo 5. 테이블 최적화...
    mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "OPTIMIZE TABLE restaurants;"
    echo.
    echo ✅ 작업 완료!
) else (
    echo ❌ 삭제 실패!
)

endlocal
pause





