@echo off
chcp 65001 >nul
echo ============================================
echo    MySQL 비밀번호 확인 스크립트
echo ============================================
echo.

cd /d "%~dp0"

set DB_USER=root
set DB_HOST=localhost
set DB_PORT=3306

echo MySQL 비밀번호를 확인하는 중...
echo.

echo 1. 비밀번호 없이 연결 시도...
mysql -u %DB_USER% -h %DB_HOST% -P %DB_PORT% -e "SELECT 'Connection OK' AS Status;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ 비밀번호 없이 연결 성공!
    echo    application.properties에서 비밀번호를 비워두셔도 됩니다.
    goto :end
)

echo ❌ 비밀번호가 필요합니다.
echo.
echo 2. 일반적인 비밀번호로 시도 중...
echo.

REM 일반적인 비밀번호들 시도
set PASSWORDS=chopplan123 chopplan12 password root 1234

for %%p in (%PASSWORDS%) do (
    echo 시도 중: %%p
    mysql -u %DB_USER% -p%%p -h %DB_HOST% -P %DB_PORT% -e "SELECT 'Connection OK' AS Status;" 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo ✅ 비밀번호 찾음: %%p
        echo.
        echo application.properties에 다음을 설정하세요:
        echo spring.datasource.password=%%p
        goto :end
    )
)

echo.
echo ⚠️  일반적인 비밀번호로는 연결되지 않습니다.
echo.
echo MySQL 비밀번호를 재설정하시겠습니까? (Y/N)
set /p reset="> "
if /i "%reset%"=="Y" (
    echo.
    echo MySQL 비밀번호 재설정 방법:
    echo 1. MySQL 서비스 중지
    echo    net stop mysql80
    echo    또는 XAMPP에서 MySQL Stop
    echo.
    echo 2. MySQL 안전 모드로 시작
    echo    mysqld --skip-grant-tables
    echo.
    echo 3. 새 창에서:
    echo    mysql -u root
    echo    ALTER USER 'root'@'localhost' IDENTIFIED BY 'chopplan123';
    echo    FLUSH PRIVILEGES;
    echo    exit
    echo.
    echo 4. MySQL 재시작
    echo.
    echo 또는 간단히 application.properties에서 비밀번호를 비워두고
    echo MySQL root 비밀번호를 제거하는 방법도 있습니다.
)

:end
pause





