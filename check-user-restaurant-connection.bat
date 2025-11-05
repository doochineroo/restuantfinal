@echo off
REM demo_users 테이블의 restaurant_id 컬럼 확인

chcp 65001 >nul
echo ============================================
echo    User와 Restaurant 연결 확인
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
echo    demo_users 테이블 구조
echo ============================================
echo.

REM 테이블 구조 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "DESCRIBE demo_users;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ demo_users 테이블 구조를 확인할 수 없습니다.
    echo.
    echo 확인사항:
    echo   1. demo_users 테이블이 존재하는지 확인
    echo   2. 비밀번호가 맞는지 확인
    echo   3. 네트워크 연결 확인
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    restaurant_id 컬럼 상세 정보
echo ============================================
echo.

REM restaurant_id 컬럼 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '%DB_NAME%' AND TABLE_NAME = 'demo_users' AND COLUMN_NAME = 'restaurant_id';" 2>nul

echo.
echo ============================================
echo    외래키 제약조건 확인
echo ============================================
echo.

REM 외래키 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '%DB_NAME%' AND TABLE_NAME = 'demo_users' AND COLUMN_NAME = 'restaurant_id';" 2>nul

echo.
echo ============================================
echo    User와 Restaurant 연결 데이터 확인
echo ============================================
echo.

REM 연결된 사용자 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT u.id, u.username, u.role, u.restaurant_id, r.restaurant_name FROM demo_users u LEFT JOIN restaurants r ON u.restaurant_id = r.id WHERE u.role = 'OWNER' LIMIT 10;" 2>nul

echo.
pause

