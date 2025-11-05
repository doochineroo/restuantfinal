@echo off
REM restaurants 테이블에 restaurant_code 컬럼 추가

chcp 65001 >nul
echo ============================================
echo    restaurant_code 컬럼 추가
echo ============================================
echo.

cd /d "%~dp0"

REM Cloud SQL 설정
set INSTANCE_NAME=chopplan-db
set DB_NAME=chopplan

echo [1/2] Cloud SQL Public IP 확인 중...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set CLOUD_SQL_IP=%%i

if "%CLOUD_SQL_IP%"=="" (
    echo ❌ Cloud SQL Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ Cloud SQL IP: %CLOUD_SQL_IP%
echo.

echo [2/2] Cloud SQL 비밀번호 입력...
set /p CLOUD_DB_PASSWORD="Cloud SQL root 비밀번호: "

if "%CLOUD_DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    restaurant_code 컬럼 추가 중...
echo ============================================
echo.

REM restaurant_code 컬럼 추가
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "ALTER TABLE restaurants ADD COLUMN restaurant_code BIGINT UNIQUE AFTER id;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ restaurant_code 컬럼이 추가되었습니다!
) else (
    echo.
    echo ⚠️  컬럼 추가 실패 (이미 존재할 수 있습니다)
    echo    확인 중...
    mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '%DB_NAME%' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'restaurant_code';" 2>nul
)

echo.
echo ============================================
echo    컬럼 확인
echo ============================================
echo.

mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "DESCRIBE restaurants;" 2>nul | findstr /i "restaurant_code"

echo.
pause

