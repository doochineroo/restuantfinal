@echo off
REM 특정 테이블 데이터 확인

setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

set DB_NAME=chopplan
set DB_USER=root
set DB_PWD=1234

echo 사용 가능한 테이블:
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SHOW TABLES;"

echo.
echo 확인할 테이블 이름을 입력하세요:
set /p "table_name=> "

if "%table_name%"=="" (
    echo 테이블 이름을 입력하세요.
    pause
    exit /b 1
)

echo.
echo %table_name% 테이블의 레코드 수:
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT COUNT(*) as total_rows FROM %table_name%;"

echo.
echo %table_name% 테이블 샘플 데이터 (최대 10개):
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT * FROM %table_name% LIMIT 10;"

pause





