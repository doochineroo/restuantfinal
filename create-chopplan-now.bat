@echo off
REM chopplan 데이터베이스 즉시 생성

chcp 65001 >nul
echo ============================================
echo    chopplan 데이터베이스 생성
echo ============================================
echo.

cd /d "%~dp0"

echo 데이터베이스 생성 중...
mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS chopplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 데이터베이스 생성 완료!
    echo.
    echo 확인:
    mysql -u root -p1234 -e "SHOW DATABASES LIKE 'chopplan';"
    echo.
    echo 이제 백엔드를 실행하세요: gradlew.bat bootRun
    echo   → JPA가 자동으로 모든 테이블을 생성합니다.
) else (
    echo.
    echo ❌ 생성 실패! MySQL 연결을 확인하세요.
)

pause





