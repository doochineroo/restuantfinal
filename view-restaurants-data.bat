@echo off
REM restaurants 테이블 데이터 상세 확인

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    restaurants 테이블 데이터 확인
echo ============================================
echo.

cd /d "%~dp0"

REM 데이터베이스 연결 정보 설정
REM 로컬 MySQL 사용 시
set DB_NAME=chopplan
set DB_USER=root
set DB_PWD=1234
set DB_HOST=localhost

REM Cloud SQL 사용 시 주석 해제하고 설정
REM set DB_HOST=[Cloud SQL Public IP]
REM set DB_PWD=[Cloud SQL 비밀번호]

echo 옵션을 선택하세요:
echo.
echo [1] 전체 레스토랑 수
echo [2] 좌표 있는/없는 레스토랑 수
echo [3] 샘플 데이터 보기 (10개)
echo [4] 좌표 없는 레스토랑 목록
echo [5] 좌표 있는 레스토랑 목록
echo [6] 특정 키워드 검색
echo.
set /p "choice=> "

if "%DB_HOST%"=="localhost" (
    set MYSQL_CMD=mysql -u %DB_USER% -p%DB_PWD% %DB_NAME%
) else (
    set MYSQL_CMD=mysql -h %DB_HOST% -u %DB_USER% -p%DB_PWD% %DB_NAME%
)

if "%choice%"=="1" (
    %MYSQL_CMD% -e "SELECT COUNT(*) as total_restaurants FROM restaurants;"
) else if "%choice%"=="2" (
    %MYSQL_CMD% -e "SELECT COUNT(*) as total, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates FROM restaurants;"
) else if "%choice%"=="3" (
    %MYSQL_CMD% -e "SELECT id, restaurant_name, branch_name, lat, lng, road_address, region_name FROM restaurants LIMIT 10;"
) else if "%choice%"=="4" (
    echo 좌표 없는 레스토랑 목록 (최대 20개):
    %MYSQL_CMD% -e "SELECT id, restaurant_name, branch_name, lat, lng FROM restaurants WHERE lat IS NULL OR lng IS NULL LIMIT 20;"
) else if "%choice%"=="5" (
    echo 좌표 있는 레스토랑 목록 (최대 20개):
    %MYSQL_CMD% -e "SELECT id, restaurant_name, branch_name, lat, lng, road_address FROM restaurants WHERE lat IS NOT NULL AND lng IS NOT NULL LIMIT 20;"
) else if "%choice%"=="6" (
    echo 검색할 키워드를 입력하세요:
    set /p "keyword=> "
    %MYSQL_CMD% -e "SELECT id, restaurant_name, branch_name, lat, lng FROM restaurants WHERE restaurant_name LIKE '%%%keyword%%%' OR branch_name LIKE '%%%keyword%%%' LIMIT 20;"
) else (
    echo 잘못된 선택입니다.
)

pause





