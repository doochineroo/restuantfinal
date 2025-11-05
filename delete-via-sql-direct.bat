@echo off
REM SQL 직접 실행으로 좌표 없는 레스토랑 삭제 (더 안정적)

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    좌표 없는 레스토랑 삭제 (SQL 직접 실행)
echo ============================================
echo.

cd /d "%~dp0"

set DB_NAME=chopplan
set DB_USER=root
set DB_PWD=1234

echo 1. 삭제 전 통계 확인...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT COUNT(*) as total_restaurants, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;"

echo.
echo 2. 삭제 확인...
echo 정말로 좌표가 없는 레스토랑을 삭제하시겠습니까? (Y/N)
set /p "confirm=> "

if /i not "!confirm!"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 3. 삭제 실행 중...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "DELETE FROM restaurants WHERE lat IS NULL OR lng IS NULL;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ 삭제 완료!
    echo.
    echo 4. 삭제 후 확인...
    mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT COUNT(*) as remaining_restaurants, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;"
    echo.
    echo 5. 테이블 최적화 중...
    mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "OPTIMIZE TABLE restaurants;"
    echo.
    echo ✅ 작업 완료!
) else (
    echo ❌ 삭제 실패!
)

endlocal
pause





