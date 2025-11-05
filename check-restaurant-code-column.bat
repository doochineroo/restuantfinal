@echo off
REM restaurants 테이블의 restaurant_code 컬럼 확인

chcp 65001 >nul
echo ============================================
echo    restaurant_code 컬럼 확인
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
echo    restaurants 테이블 구조 확인
echo ============================================
echo.

REM restaurant_code 컬럼 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "DESCRIBE restaurants;" 2>nul | findstr /i "restaurant_code"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ restaurant_code 컬럼이 없습니다!
    echo.
    echo 해결 방법:
    echo   1. 백엔드를 실행하면 자동으로 컬럼이 추가됩니다
    echo   2. 또는 수동으로 컬럼을 추가해야 합니다
    echo.
) else (
    echo.
    echo ✅ restaurant_code 컬럼이 존재합니다!
    echo.
)

echo.
echo ============================================
echo    restaurant_code 컬럼 상세 정보
echo ============================================
echo.

mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '%DB_NAME%' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'restaurant_code';" 2>nul

echo.
echo ============================================
echo    restaurant_code 데이터 샘플 확인
echo ============================================
echo.

mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT id, restaurant_code, restaurant_name FROM restaurants WHERE restaurant_code IS NOT NULL LIMIT 10;" 2>nul

echo.
echo ============================================
echo    restaurant_code가 NULL인 데이터 개수
echo ============================================
echo.

mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as null_count FROM restaurants WHERE restaurant_code IS NULL;" 2>nul

echo.
echo ============================================
echo    restaurant_code가 있는 데이터 개수
echo ============================================
echo.

mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as not_null_count FROM restaurants WHERE restaurant_code IS NOT NULL;" 2>nul

echo.
pause

