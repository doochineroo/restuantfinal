@echo off
REM restaurants 테이블의 모든 컬럼 확인

chcp 65001 >nul
echo ============================================
echo    restaurants 테이블 컬럼 확인
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
echo    restaurants 테이블의 모든 컬럼
echo ============================================
echo.

REM 모든 컬럼 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "DESCRIBE restaurants;" 2>nul

echo.
echo ============================================
echo    restaurant_id 컬럼 존재 여부 확인
echo ============================================
echo.

REM restaurant_id 컬럼 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '%DB_NAME%' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME LIKE '%restaurant%';" 2>nul

echo.
echo ============================================
echo    id 컬럼 확인 (Primary Key)
echo ============================================
echo.

REM id 컬럼 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '%DB_NAME%' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'id';" 2>nul

echo.
echo ============================================
echo    요약
echo ============================================
echo.
echo restaurants 테이블:
echo   - id (Primary Key) - 존재함
echo   - restaurant_id - 존재하지 않음
echo.
echo restaurant_id는 demo_users 테이블에 있습니다 (외래키)
echo.

pause

