@echo off
REM 데이터베이스 빠른 확인

setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

REM MySQL 설치 확인
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL이 설치되지 않았거나 PATH에 없습니다.
    echo.
    echo MySQL 설치 확인:
    echo   1. XAMPP Control Panel에서 MySQL 시작
    echo   2. 또는 MySQL이 설치되어 있는지 확인
    echo.
    pause
    exit /b 1
)

set DB_NAME=chopplan
set DB_USER=root
set DB_PWD=1234

echo ============================================
echo    빠른 데이터베이스 확인
echo ============================================
echo.

echo 1. 테이블 목록:
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SHOW TABLES;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  연결 실패. 비밀번호를 확인하세요.
    echo    MySQL이 실행 중인지 확인하세요.
    echo.
)

echo.
echo 2. 테이블별 레코드 수:
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT table_name AS 'Table', table_rows AS 'Rows' FROM information_schema.tables WHERE table_schema = 'chopplan' ORDER BY table_rows DESC;" 2>nul

echo.
echo 3. restaurants 테이블 통계:
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT COUNT(*) as total, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates FROM restaurants;" 2>nul

echo.
echo 4. restaurants 샘플 데이터 (5개):
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT id, restaurant_name, branch_name, lat, lng FROM restaurants LIMIT 5;" 2>nul

echo.
pause
