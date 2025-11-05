@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    좌표가 없는 레스토랑 삭제 스크립트
echo ============================================
echo.
echo 이 스크립트는 lat 또는 lng가 NULL인 레스토랑을 삭제합니다.
echo.

REM 현재 디렉토리에서 실행
cd /d "%~dp0"

echo 1. MySQL 연결 확인 중...

REM application.properties에서 연결 정보 읽기 (간단한 방식)
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=restaurant-demo
set DB_USER=root
set DB_PASSWORD_INPUT=
set HAS_PASSWORD=0

echo    Host: %DB_HOST%
echo    Port: %DB_PORT%
echo    Database: %DB_NAME%
echo    Username: %DB_USER%
echo.

REM MySQL 클라이언트 확인
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL 클라이언트를 찾을 수 없습니다.
    echo    MySQL이 설치되어 있고 PATH에 추가되어 있는지 확인하세요.
    echo.
    echo 대안: MySQL Workbench나 DBeaver에서 cleanup-restaurants-without-coordinates.sql 파일을 실행하세요.
    pause
    exit /b 1
)

echo 2. 삭제 전 데이터 확인 중...
echo.

REM 먼저 비밀번호 없이 시도
mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT COUNT(*) as total_restaurants, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  비밀번호가 필요합니다.
    echo    MySQL root 비밀번호를 입력하세요: 
    set /p "DB_PASSWORD_INPUT=비밀번호: "
    if not "!DB_PASSWORD_INPUT!"=="" (
        set HAS_PASSWORD=1
    )
    
    echo.
    echo 삭제 전 데이터 확인 중...
    if !HAS_PASSWORD! EQU 1 (
        mysql -u %DB_USER% -p!DB_PASSWORD_INPUT! -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT COUNT(*) as total_restaurants, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;" 2>nul
        if !ERRORLEVEL! NEQ 0 (
            echo ❌ 연결 실패! 비밀번호를 확인하세요.
            pause
            exit /b 1
        )
    ) else (
        mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT COUNT(*) as total_restaurants, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;"
    )
)

echo.
echo ============================================
echo ⚠️  주의: 이 작업은 되돌릴 수 없습니다!
echo ============================================
echo.
echo 삭제할 레코드를 미리 확인하시겠습니까? (Y/N)
set /p "preview=> "
set "preview=!preview!"
if /i "!preview!"=="Y" (
    echo.
    echo 삭제될 레코드 샘플 (최대 10개):
    if !HAS_PASSWORD! EQU 1 (
        mysql -u %DB_USER% -p!DB_PASSWORD_INPUT! -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT id, restaurant_name, branch_name, lat, lng FROM restaurants WHERE lat IS NULL OR lng IS NULL LIMIT 10;" 2>nul
    ) else (
        mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT id, restaurant_name, branch_name, lat, lng FROM restaurants WHERE lat IS NULL OR lng IS NULL LIMIT 10;" 2>nul
    )
    echo.
)

echo.
echo 정말로 좌표가 없는 레스토랑을 삭제하시겠습니까? (Y/N)
set /p "confirm=> "
set "confirm=!confirm!"

if /i not "!confirm!"=="Y" (
    echo.
    echo 작업이 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 3. 좌표가 없는 레스토랑 삭제 중...
if !HAS_PASSWORD! EQU 1 (
    mysql -u %DB_USER% -p!DB_PASSWORD_INPUT! -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "DELETE FROM restaurants WHERE lat IS NULL OR lng IS NULL;" 2>nul
) else (
    mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "DELETE FROM restaurants WHERE lat IS NULL OR lng IS NULL;" 2>nul
)

if %ERRORLEVEL% EQU 0 (
    echo ✅ 삭제 완료!
    
    echo.
    echo 4. 삭제 후 데이터 확인 중...
    if !HAS_PASSWORD! EQU 1 (
        mysql -u %DB_USER% -p!DB_PASSWORD_INPUT! -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT COUNT(*) as remaining_restaurants, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;" 2>nul
    ) else (
        mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "SELECT COUNT(*) as remaining_restaurants, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;" 2>nul
    )
    
    echo.
    echo 5. 테이블 최적화 중 (데이터베이스 크기 최적화)...
    if !HAS_PASSWORD! EQU 1 (
        mysql -u %DB_USER% -p!DB_PASSWORD_INPUT! -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "OPTIMIZE TABLE restaurants;" 2>nul
    ) else (
        mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME% -e "OPTIMIZE TABLE restaurants;" 2>nul
    )
    
    echo.
    echo ============================================
    echo ✅ 작업 완료!
    echo ============================================
) else (
    echo.
    echo ❌ 삭제 실패!
    echo    MySQL 연결 정보와 비밀번호를 확인하세요.
)

echo.
endlocal
pause
