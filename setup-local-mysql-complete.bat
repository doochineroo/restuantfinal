@echo off
REM 로컬 MySQL 완전 새로 설정 (처음부터 끝까지)

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    로컬 MySQL 완전 새로 설정
echo ============================================
echo.

cd /d "%~dp0"

echo 1. MySQL 서버 실행 확인...
netstat -ano | findstr :3306 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL 서버가 실행되지 않았습니다!
    echo.
    echo 해결 방법:
    echo [XAMPP 사용 시]
    echo   1. XAMPP Control Panel 실행
    echo   2. MySQL 옆의 "Start" 버튼 클릭
    echo   3. 이 스크립트 다시 실행
    echo.
    echo [MySQL 직접 설치 시]
    echo   1. 서비스 관리자 실행 (services.msc)
    echo   2. MySQL80 서비스 찾기
    echo   3. 시작 버튼 클릭
    echo   4. 또는 명령어: net start mysql80
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL 서버 실행 중
echo.

echo 2. MySQL 접속 테스트...
echo    비밀번호 없이 접속 시도...
echo exit | mysql -u root -e "SELECT 'SUCCESS' AS Status;" 2>nul | findstr /C:"SUCCESS" >nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ 비밀번호 없이 접속 성공!
    set HAS_PASSWORD=0
) else (
    echo ⚠️  비밀번호가 필요합니다.
    set HAS_PASSWORD=1
)

echo.
echo 3. 데이터베이스 생성 중...
set DB_NAME=restaurant-demo

if !HAS_PASSWORD! EQU 0 (
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`%DB_NAME%\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
) else (
    echo MySQL 비밀번호를 입력하세요:
    set /p "MYSQL_PWD=> "
    mysql -u root -p!MYSQL_PWD! -e "CREATE DATABASE IF NOT EXISTS \`%DB_NAME%\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
)

if %ERRORLEVEL% EQU 0 (
    echo ✅ 데이터베이스 생성 완료!
    echo.
    echo 4. application.properties 설정 확인...
    
    if !HAS_PASSWORD! EQU 0 (
        echo    비밀번호 없이 설정합니다...
        powershell -Command "(Get-Content 'src\main\resources\application.properties') -replace 'spring\.datasource\.password=.*', 'spring.datasource.password=' | Set-Content 'src\main\resources\application.properties'"
        echo ✅ application.properties 업데이트 완료 (비밀번호 없음)
    ) else (
        echo    비밀번호를 설정합니다...
        powershell -Command "(Get-Content 'src\main\resources\application.properties') -replace 'spring\.datasource\.password=.*', 'spring.datasource.password=!MYSQL_PWD!' | Set-Content 'src\main\resources\application.properties'"
        echo ✅ application.properties 업데이트 완료 (비밀번호: !MYSQL_PWD!)
    )
    
    echo.
    echo ============================================
    echo ✅ 설정 완료!
    echo ============================================
    echo.
    echo 📊 연결 정보:
    echo    Host: localhost
    echo    Port: 3306
    echo    Database: %DB_NAME%
    echo    Username: root
    if !HAS_PASSWORD! EQU 0 (
        echo    Password: (없음)
    ) else (
        echo    Password: !MYSQL_PWD!
    )
    echo.
    echo 다음 단계:
    echo   1. 백엔드 실행: gradlew.bat bootRun
    echo   2. DBeaver 연결 설정 (위 정보 사용)
    echo.
) else (
    echo ❌ 데이터베이스 생성 실패!
    echo    MySQL 비밀번호를 확인하세요.
    echo.
    echo 수동으로 실행:
    echo   mysql -u root -p
    echo   CREATE DATABASE IF NOT EXISTS `restaurant-demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo   EXIT;
)

endlocal
pause





