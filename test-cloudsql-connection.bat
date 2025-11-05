@echo off
REM Cloud SQL 데이터베이스 연결 테스트

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 데이터베이스 연결 테스트
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

REM 연결 정보 확인
echo 연결 정보 확인 중...
echo.

REM Public IP 확인
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set PUBLIC_IP=%%i

if "%PUBLIC_IP%"=="" (
    echo ❌ Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ Public IP: %PUBLIC_IP%
echo.

REM 비밀번호 입력
echo Cloud SQL root 비밀번호를 입력하세요:
set /p DB_PASSWORD="비밀번호: "

if "%DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

set DB_NAME=chopplan
set DB_USER=root

echo.
echo ============================================
echo    연결 테스트
echo ============================================
echo.

echo [1/4] 기본 연결 테스트...
mysql -h %PUBLIC_IP% -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 'Connection OK' AS Status;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 연결 실패!
    echo.
    echo 원인 확인:
    echo   1. 비밀번호가 맞는지 확인
    echo   2. Public IP가 활성화되었는지 확인
    echo   3. 승인된 네트워크에 본인 IP가 추가되었는지 확인
    pause
    exit /b 1
)

echo ✅ 연결 성공!
echo.

echo [2/4] 데이터베이스 목록 확인...
mysql -h %PUBLIC_IP% -u %DB_USER% -p%DB_PASSWORD% -e "SHOW DATABASES;" 2>nul

echo.
echo [3/4] chopplan 데이터베이스 확인...
mysql -h %PUBLIC_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT 'Database OK' AS Status;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  chopplan 데이터베이스가 없습니다.
    echo    데이터베이스를 생성해야 합니다.
) else (
    echo ✅ chopplan 데이터베이스 확인됨!
)

echo.
echo [4/4] 테이블 목록 확인...
mysql -h %PUBLIC_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SHOW TABLES;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 테이블 목록 확인 완료!
    echo.
    echo 테이블별 레코드 수:
    mysql -h %PUBLIC_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT table_name AS 'Table', table_rows AS 'Rows' FROM information_schema.tables WHERE table_schema = '%DB_NAME%' ORDER BY table_rows DESC;" 2>nul
) else (
    echo ⚠️  테이블이 없거나 데이터베이스가 비어있습니다.
)

echo.
echo ============================================
echo    연결 정보 요약
echo ============================================
echo.
echo Host: %PUBLIC_IP%
echo Port: 3306
echo Database: %DB_NAME%
echo Username: %DB_USER%
echo.
echo ✅ 연결 테스트 완료!
echo.
pause

