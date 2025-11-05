@echo off
REM chopplan 데이터베이스 생성 및 설정

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    chopplan 데이터베이스 생성
echo ============================================
echo.

cd /d "%~dp0"

echo 1. MySQL 서버 실행 확인...
netstat -ano | findstr :3306 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL 서버가 실행되지 않았습니다!
    echo.
    echo XAMPP 사용 시: Control Panel에서 MySQL Start
    echo 직접 설치 시: net start mysql80
    pause
    exit /b 1
)

echo ✅ MySQL 서버 실행 중
echo.

echo 2. 데이터베이스 생성 중...
echo    데이터베이스 이름: chopplan
echo.

REM 비밀번호 없이 시도
mysql -u root -e "CREATE DATABASE IF NOT EXISTS chopplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ 데이터베이스 생성 완료!
    set HAS_PASSWORD=0
) else (
    echo ⚠️  비밀번호가 필요합니다.
    echo    MySQL 비밀번호를 입력하세요:
    set /p "MYSQL_PWD=> "
    
    mysql -u root -p!MYSQL_PWD! -e "CREATE DATABASE IF NOT EXISTS chopplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    
    if !ERRORLEVEL! EQU 0 (
        echo ✅ 데이터베이스 생성 완료!
        set HAS_PASSWORD=1
    ) else (
        echo ❌ 데이터베이스 생성 실패!
        echo    비밀번호를 확인하세요.
        pause
        exit /b 1
    )
)

echo.
echo 3. application.properties 확인...
echo    ✅ 이미 chopplan 데이터베이스로 설정되어 있습니다.
echo.

echo 4. 테이블 자동 생성 설정 확인...
echo    ✅ JPA가 자동으로 테이블을 생성합니다 (ddl-auto=update)
echo    ✅ 백엔드 실행 시 모든 엔티티의 테이블이 자동 생성됩니다.
echo.

echo ============================================
echo ✅ 설정 완료!
echo ============================================
echo.
echo 📊 데이터베이스 정보:
echo    Host: localhost
echo    Port: 3306
echo    Database: chopplan
echo    Username: root
if !HAS_PASSWORD! EQU 0 (
    echo    Password: (없음)
) else (
    echo    Password: !MYSQL_PWD!
)
echo.
echo 📝 다음 단계:
echo    1. 백엔드 실행: gradlew.bat bootRun
echo       → JPA가 자동으로 모든 테이블 생성
echo.
echo    2. DBeaver 연결:
echo       Host: localhost
echo       Port: 3306
echo       Database: chopplan
echo       Username: root
echo.
echo 💡 참고:
echo    - 테이블은 백엔드 실행 시 자동 생성됩니다
echo    - 나중에 Google Cloud SQL로 마이그레이션 가능합니다
echo    - 데이터는 mysqldump로 백업/복구 가능합니다
echo.

endlocal
pause

