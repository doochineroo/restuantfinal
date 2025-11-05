@echo off
REM 로컬 MySQL 데이터를 Cloud SQL로 마이그레이션

chcp 65001 >nul
echo ============================================
echo    로컬 MySQL → Cloud SQL 데이터 마이그레이션
echo ============================================
echo.

cd /d "%~dp0"

REM 로컬 MySQL 설정
set LOCAL_DB_NAME=chopplan
set LOCAL_DB_USER=root
set LOCAL_DB_PWD=1234

REM Cloud SQL 설정
set INSTANCE_NAME=chopplan-db
set CLOUD_DB_NAME=chopplan

echo [1/5] 로컬 데이터베이스 확인...
mysql -u %LOCAL_DB_USER% -p%LOCAL_DB_PWD% %LOCAL_DB_NAME% -e "SELECT COUNT(*) as total_restaurants FROM restaurants;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 로컬 MySQL 연결 실패
    echo    MySQL이 실행 중인지 확인하세요.
    pause
    exit /b 1
)

echo ✅ 로컬 데이터베이스 확인됨
echo.

echo [2/5] 데이터베이스 덤프 생성 중...
echo    파일: chopplan_backup.sql
echo.

mysqldump -u %LOCAL_DB_USER% -p%LOCAL_DB_PWD% %LOCAL_DB_NAME% --single-transaction --routines --triggers > chopplan_backup.sql 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 덤프 생성 실패!
    echo    MySQL이 실행 중인지 확인하세요.
    pause
    exit /b 1
)

echo ✅ 덤프 파일 생성 완료
echo.

for %%F in (chopplan_backup.sql) do (
    set /a FILE_SIZE=%%~zF / 1024
    echo    파일 크기: !FILE_SIZE! KB
)

echo.
echo [3/5] Cloud SQL Public IP 확인 중...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set CLOUD_SQL_IP=%%i

if "%CLOUD_SQL_IP%"=="" (
    echo ❌ Cloud SQL Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ Cloud SQL IP: %CLOUD_SQL_IP%
echo.

echo [4/5] Cloud SQL 비밀번호 입력...
set /p CLOUD_DB_PASSWORD="Cloud SQL root 비밀번호: "

if "%CLOUD_DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo [5/5] Cloud SQL로 데이터 가져오기 중...
echo    이 작업은 몇 분 소요될 수 있습니다...
echo.

mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %CLOUD_DB_NAME% < chopplan_backup.sql 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 데이터 마이그레이션 완료!
    echo.
    echo 데이터 확인 중...
    mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %CLOUD_DB_NAME% -e "SELECT COUNT(*) as total_restaurants FROM restaurants;" 2>nul
    echo.
    echo ✅ Cloud SQL에 데이터가 성공적으로 가져와졌습니다!
) else (
    echo.
    echo ❌ 데이터 가져오기 실패
    echo.
    echo 원인 확인:
    echo   1. 비밀번호가 맞는지 확인
    echo   2. 네트워크 연결 확인
    echo   3. 승인된 네트워크에 본인 IP가 추가되었는지 확인
    echo.
    echo 대안: DBeaver를 사용하여 가져오기
    echo   1. DBeaver에서 Cloud SQL 연결
    echo   2. SQL 편집기 열기
    echo   3. chopplan_backup.sql 파일 실행
)

echo.
pause

