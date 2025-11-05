@echo off
REM 데이터베이스 데이터 확인 스크립트

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    chopplan 데이터베이스 데이터 확인
echo ============================================
echo.

cd /d "%~dp0"

set DB_NAME=chopplan
set DB_USER=root
set DB_PWD=1234

echo 1. 데이터베이스 목록 확인...
mysql -u %DB_USER% -p%DB_PWD% -e "SHOW DATABASES;"

echo.
echo 2. chopplan 데이터베이스 테이블 목록...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SHOW TABLES;"

echo.
echo 3. 테이블별 레코드 수...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT table_name AS 'Table', table_rows AS 'Rows' FROM information_schema.tables WHERE table_schema = 'chopplan' ORDER BY table_rows DESC;"

echo.
echo 4. restaurants 테이블 통계...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "
SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
FROM restaurants;
"

echo.
echo 5. restaurants 테이블 샘플 데이터 (최대 10개)...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "
SELECT id, restaurant_name, branch_name, lat, lng, road_address 
FROM restaurants 
LIMIT 10;
"

echo.
echo 6. 데이터베이스 크기...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "SELECT table_name AS 'Table', ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)', table_rows AS 'Rows' FROM information_schema.tables WHERE table_schema = 'chopplan' ORDER BY (data_length + index_length) DESC;"

echo.
echo ============================================
echo ✅ 확인 완료
echo ============================================
pause





