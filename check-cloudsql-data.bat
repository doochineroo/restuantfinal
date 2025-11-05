@echo off
REM Cloud SQL 데이터베이스 확인 스크립트
REM Cloud SQL Public IP를 사용하여 데이터 확인

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 데이터베이스 확인
echo ============================================
echo.

cd /d "%~dp0"

REM Cloud SQL 연결 정보 확인
echo 🔍 Cloud SQL 연결 정보 확인 중...
echo.

REM application-cloudsql.properties에서 IP 읽기
findstr /C:"spring.datasource.url" src\main\resources\application-cloudsql.properties >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ application-cloudsql.properties 파일을 찾을 수 없습니다.
    echo    먼저 Cloud SQL 설정을 완료하세요.
    echo.
    pause
    exit /b 1
)

REM IP 추출 (간단한 방법)
echo Cloud SQL Public IP를 입력하세요:
set /p CLOUD_SQL_IP="IP 주소: "
if "%CLOUD_SQL_IP%"=="" (
    echo ❌ IP 주소를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
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

mysql -h %CLOUD_SQL_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT 'Connection OK' AS Status;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 연결 실패
    echo    IP 주소와 비밀번호를 확인하세요.
    pause
    exit /b 1
)
echo ✅ 연결 성공!

echo.
echo ============================================
echo    데이터 확인
echo ============================================
echo.

echo 1. 테이블 목록:
mysql -h %CLOUD_SQL_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SHOW TABLES;"

echo.
echo 2. 테이블별 레코드 수:
mysql -h %CLOUD_SQL_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT table_name AS 'Table', table_rows AS 'Rows' FROM information_schema.tables WHERE table_schema = '%DB_NAME%' ORDER BY table_rows DESC;"

echo.
echo 3. restaurants 테이블 통계:
mysql -h %CLOUD_SQL_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as total_restaurants, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates FROM restaurants;"

echo.
echo 4. restaurants 샘플 데이터 (10개):
mysql -h %CLOUD_SQL_IP% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT id, restaurant_name, branch_name, lat, lng, road_address FROM restaurants LIMIT 10;"

echo.
echo ============================================
echo ✅ 확인 완료
echo ============================================
echo.
pause

