@echo off
REM 간단한 버전 - 비밀번호를 환경변수나 파일에서 읽기
REM 사용법: cleanup-restaurants-simple.bat [password]
REM 또는: set MYSQL_PASSWORD=yourpassword && cleanup-restaurants-simple.bat

setlocal enabledelayedexpansion
chcp 65001 >nul

echo ============================================
echo    좌표가 없는 레스토랑 삭제 스크립트 (간단 버전)
echo ============================================
echo.

cd /d "%~dp0"

set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=restaurant-demo
set DB_USER=root

REM 비밀번호 처리: 명령줄 인자 또는 환경변수
if not "%~1"=="" (
    set MYSQL_PASSWORD=%~1
) else if not "%MYSQL_PASSWORD%"=="" (
    REM 환경변수에서 읽기
) else (
    REM 비밀번호 입력 요청
    set /p "MYSQL_PASSWORD=MySQL 비밀번호 (없으면 Enter): "
)

REM MySQL 명령어 생성
if "!MYSQL_PASSWORD!"=="" (
    set MYSQL_CMD=mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% %DB_NAME%
) else (
    set MYSQL_CMD=mysql -u %DB_USER% -p!MYSQL_PASSWORD! -h %DB_HOST% -P %DB_PORT% %DB_NAME%
)

echo.
echo 1. 삭제 전 통계 확인...
!MYSQL_CMD! -e "SELECT COUNT(*) as total_restaurants, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates FROM restaurants;" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 연결 실패! 비밀번호를 확인하세요.
    pause
    exit /b 1
)

echo.
echo 2. 삭제 확인...
echo 정말로 좌표가 없는 레스토랑을 삭제하시겠습니까? (Y/N)
set /p "confirm=> "
if /i not "!confirm!"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 3. 삭제 실행...
!MYSQL_CMD! -e "DELETE FROM restaurants WHERE lat IS NULL OR lng IS NULL;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ 삭제 완료!
    echo.
    echo 4. 삭제 후 확인...
    !MYSQL_CMD! -e "SELECT COUNT(*) as remaining_restaurants FROM restaurants;" 2>nul
    echo.
    echo 5. 테이블 최적화...
    !MYSQL_CMD! -e "OPTIMIZE TABLE restaurants;" 2>nul
    echo ✅ 완료!
) else (
    echo ❌ 삭제 실패!
)

endlocal
pause





