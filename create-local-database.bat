@echo off
REM 로컬 MySQL 데이터베이스 생성 스크립트

chcp 65001 >nul
echo ============================================
echo    로컬 MySQL 데이터베이스 생성
echo ============================================
echo.

cd /d "%~dp0"

set DB_NAME=restaurant-demo
set DB_USER=root

echo 1. MySQL 서버 실행 확인...
netstat -ano | findstr :3306 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL 서버가 실행되지 않았습니다.
    echo.
    echo XAMPP 사용 시: Control Panel에서 MySQL Start
    echo 직접 설치 시: net start mysql80
    pause
    exit /b 1
)
echo ✅ MySQL 서버 실행 중
echo.

echo 2. 데이터베이스 생성 중...
echo    데이터베이스 이름: %DB_NAME%
echo.

REM 일반적인 비밀번호 시도
set PASSWORDS=chopplan123 chopplan12 password root 1234

for %%p in (%PASSWORDS%) do (
    echo [시도] 비밀번호: %%p
    mysql -u %DB_USER% -p%%p -e "CREATE DATABASE IF NOT EXISTS \`%DB_NAME%\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo ✅ 성공! 데이터베이스 생성 완료
        echo.
        echo 사용된 비밀번호: %%p
        echo.
        echo DBeaver 연결 정보:
        echo   Host: localhost
        echo   Port: 3306
        echo   Database: %DB_NAME%
        echo   Username: %DB_USER%
        echo   Password: %%p
        pause
        exit /b 0
    )
)

echo.
echo ⚠️  비밀번호로는 연결되지 않습니다.
echo    MySQL 비밀번호를 직접 입력하세요:
set /p "MYSQL_PWD=> "

if not "!MYSQL_PWD!"=="" (
    mysql -u %DB_USER% -p!MYSQL_PWD! -e "CREATE DATABASE IF NOT EXISTS \`%DB_NAME%\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    
    if !ERRORLEVEL! EQU 0 (
        echo ✅ 데이터베이스 생성 완료!
        echo.
        echo DBeaver 연결 정보:
        echo   Host: localhost
        echo   Port: 3306
        echo   Database: %DB_NAME%
        echo   Username: %DB_USER%
        echo   Password: !MYSQL_PWD!
    ) else (
        echo ❌ 실패! 비밀번호를 확인하세요.
    )
)

pause





