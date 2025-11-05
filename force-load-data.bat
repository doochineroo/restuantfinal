@echo off
REM 데이터베이스 초기화 후 강제로 데이터 로드

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    데이터베이스 초기화 및 데이터 로드
echo ============================================
echo.

cd /d "%~dp0"

set DB_NAME=chopplan
set DB_USER=root
set DB_PWD=1234

echo ⚠️  주의: 이 작업은 restaurants 테이블의 모든 데이터를 삭제합니다!
echo.
echo 정말로 진행하시겠습니까? (Y/N)
set /p "confirm=> "

if /i not "!confirm!"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 1. 기존 데이터 삭제 중...
mysql -u %DB_USER% -p%DB_PWD% %DB_NAME% -e "DELETE FROM restaurants;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ 데이터 삭제 완료
    echo.
    echo 2. 이제 백엔드를 실행하세요:
    echo    gradlew.bat bootRun
    echo.
    echo    백엔드가 자동으로 CSV에서 데이터를 로드합니다.
) else (
    echo ❌ 삭제 실패!
)

pause





