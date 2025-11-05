@echo off
REM MySQL 비밀번호 빠른 수정 스크립트

chcp 65001 >nul
echo ============================================
echo    MySQL 비밀번호 빠른 수정
echo ============================================
echo.

cd /d "%~dp0"

echo 1. 일반적인 비밀번호로 MySQL 접속 시도...
echo.

REM 일반적인 비밀번호들 시도
set PASSWORDS=chopplan123 chopplan12 password root 1234 admin

for %%p in (%PASSWORDS%) do (
    echo 시도 중: %%p
    echo exit | mysql -u root -p%%p -e "SELECT 'Connection OK' AS Status;" 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo.
        echo ✅ 비밀번호 찾음: %%p
        echo.
        echo 2. application.properties 수정 중...
        
        REM application.properties에서 password= 라인 찾아서 수정
        powershell -Command "(Get-Content 'src\main\resources\application.properties') -replace 'spring\.datasource\.password=', 'spring.datasource.password=%%p' | Set-Content 'src\main\resources\application.properties'"
        
        echo ✅ application.properties가 업데이트되었습니다!
        echo.
        echo 설정된 비밀번호: %%p
        echo.
        echo 이제 백엔드를 실행하세요: gradlew.bat bootRun
        pause
        exit /b 0
    )
)

echo.
echo ❌ 일반적인 비밀번호로는 연결되지 않습니다.
echo.
echo 다음 중 하나를 선택하세요:
echo.
echo [1] MySQL 비밀번호 재설정 (비밀번호 제거)
echo [2] 수동으로 비밀번호 입력하여 application.properties 수정
echo.
set /p "choice=> "

if "%choice%"=="1" (
    echo.
    echo MySQL 비밀번호를 제거하려면:
    echo 1. mysql -u root -p (현재 비밀번호로 접속)
    echo 2. ALTER USER 'root'@'localhost' IDENTIFIED BY '';
    echo 3. FLUSH PRIVILEGES;
    echo 4. EXIT;
    echo.
    echo 그 후 application.properties는 그대로 두면 됩니다.
) else (
    echo.
    echo MySQL 비밀번호를 입력하세요:
    set /p "mysql_password=> "
    
    if not "!mysql_password!"=="" (
        echo.
        echo application.properties 수정 중...
        powershell -Command "(Get-Content 'src\main\resources\application.properties') -replace 'spring\.datasource\.password=', 'spring.datasource.password=!mysql_password!' | Set-Content 'src\main\resources\application.properties'"
        
        echo ✅ application.properties가 업데이트되었습니다!
        echo.
        echo 이제 백엔드를 실행하세요: gradlew.bat bootRun
    )
)

pause





