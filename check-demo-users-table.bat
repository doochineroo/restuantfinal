@echo off
REM demo_users 테이블 존재 여부 확인

chcp 65001 >nul
echo ============================================
echo    demo_users 테이블 확인
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
echo    모든 테이블 목록 확인
echo ============================================
echo.

REM 모든 테이블 목록 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SHOW TABLES;" 2>nul

echo.
echo ============================================
echo    demo_users 테이블 존재 여부
echo ============================================
echo.

REM demo_users 테이블 존재 여부 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_schema = '%DB_NAME%' AND table_name = 'demo_users';" 2>nul

echo.
echo ============================================
echo    demo_users 테이블 구조 (존재하는 경우)
echo ============================================
echo.

REM demo_users 테이블 구조 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "DESCRIBE demo_users;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ demo_users 테이블이 존재하지 않습니다!
    echo.
    echo 해결 방법:
    echo   1. 백엔드를 실행하면 자동으로 테이블이 생성됩니다 (spring.jpa.hibernate.ddl-auto=update)
    echo   2. 또는 수동으로 테이블을 생성해야 합니다
)

echo.
pause

