@echo off
REM restaurant_id 외래키 제약조건 확인 및 수정

chcp 65001 >nul
echo ============================================
echo    restaurant_id 외래키 확인 및 수정
echo ============================================
echo.

cd /d "%~dp0"

REM Cloud SQL 설정
set INSTANCE_NAME=chopplan-db
set DB_NAME=chopplan

echo [1/3] Cloud SQL Public IP 확인 중...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set CLOUD_SQL_IP=%%i

if "%CLOUD_SQL_IP%"=="" (
    echo ❌ Cloud SQL Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ Cloud SQL IP: %CLOUD_SQL_IP%
echo.

echo [2/3] Cloud SQL 비밀번호 입력...
set /p CLOUD_DB_PASSWORD="Cloud SQL root 비밀번호: "

if "%CLOUD_DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    현재 외래키 제약조건 확인
echo ============================================
echo.

REM 외래키 제약조건 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '%DB_NAME%' AND TABLE_NAME = 'demo_users' AND COLUMN_NAME = 'restaurant_id';" 2>nul

echo.
echo ============================================
echo    restaurant_id 컬럼 정보 확인
echo ============================================
echo.

REM restaurant_id 컬럼 정보 확인
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SHOW CREATE TABLE demo_users\G" 2>nul

echo.
echo ============================================
echo    외래키 제약조건 추가 (없는 경우)
echo ============================================
echo.

echo ⚠️  외래키가 없으면 추가하시겠습니까?
set /p add_fk="외래키 추가 (Y/N): "

if /i "%add_fk%"=="Y" (
    echo.
    echo 외래키 제약조건 추가 중...
    mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "ALTER TABLE demo_users ADD CONSTRAINT fk_user_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL ON UPDATE CASCADE;" 2>nul
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 외래키 제약조건이 추가되었습니다!
    ) else (
        echo ❌ 외래키 제약조건 추가 실패 (이미 존재할 수 있습니다)
    )
)

echo.
pause

