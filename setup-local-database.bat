@echo off
chcp 65001 >nul
echo ============================================
echo    로컬 MySQL 데이터베이스 설정 (무료 사용)
echo ============================================
echo.
echo 이 스크립트는 AWS RDS 대신 로컬 MySQL을 설정합니다.
echo.

REM 현재 디렉토리에서 실행
cd /d "%~dp0"

echo 1. MySQL 설치 확인 중...
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL이 설치되지 않았습니다.
    echo.
    echo 📥 설치 방법:
    echo    1. XAMPP 다운로드: https://www.apachefriends.org/download.html
    echo    2. 또는 MySQL 직접 설치: https://dev.mysql.com/downloads/mysql/
    echo.
    echo ⚠️  XAMPP 설치 후 MySQL 서비스를 시작하고 다시 실행하세요.
    pause
    exit /b 1
)
echo ✅ MySQL 설치 확인됨

echo.
echo 2. MySQL 서비스 시작 확인 중...
net start mysql80 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    net start MySQL >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ⚠️  MySQL 서비스가 실행 중이 아닙니다.
        echo    XAMPP Control Panel에서 MySQL을 시작하거나
        echo    서비스 관리자에서 MySQL 서비스를 시작하세요.
        echo.
        echo    계속 진행하시겠습니까? (Y/N)
        set /p continue="> "
        if /i not "%continue%"=="Y" (
            exit /b 1
        )
    )
)

echo.
echo 3. 데이터베이스 생성 중...
echo    데이터베이스: restaurant-demo
echo.

REM root 비밀번호가 없는 경우 시도
mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`restaurant-demo\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ 데이터베이스 생성 완료
    set MYSQL_PWD_NEEDED=0
) else (
    echo ⚠️  root 비밀번호가 필요합니다.
    echo    MySQL root 비밀번호를 입력하세요:
    set /p MYSQL_ROOT_PWD="비밀번호: "
    mysql -u root -p%MYSQL_ROOT_PWD% -e "CREATE DATABASE IF NOT EXISTS \`restaurant-demo\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 데이터베이스 생성 완료
        set MYSQL_PWD_NEEDED=1
    ) else (
        echo ❌ 데이터베이스 생성 실패
        echo    비밀번호가 올바른지 확인하세요.
        pause
        exit /b 1
    )
)

echo.
echo 4. 연결 테스트 중...
if %MYSQL_PWD_NEEDED%==0 (
    mysql -u root -e "USE \`restaurant-demo\`; SELECT 'Connection OK' AS Status;" 2>nul
) else (
    mysql -u root -p%MYSQL_ROOT_PWD% -e "USE \`restaurant-demo\`; SELECT 'Connection OK' AS Status;" 2>nul
)

if %ERRORLEVEL% EQU 0 (
    echo ✅ 연결 테스트 성공!
) else (
    echo ⚠️  연결 테스트 실패
)

echo.
echo ============================================
echo    설정 완료!
echo ============================================
echo.
echo 📊 연결 정보:
echo    Host: localhost
echo    Port: 3306
echo    Database: restaurant-demo
echo    Username: root
echo    Password: (설정한 비밀번호 또는 없음)
echo.
echo 📝 다음 단계:
echo    1. application.properties에서 비밀번호 확인
echo    2. 백엔드 실행: gradlew.bat bootRun
echo    3. 프론트엔드 실행: cd frontend ^&^& npm start
echo.
echo 💡 비밀번호가 있다면 application.properties에서 설정하세요:
echo    spring.datasource.password=your-password
echo.
pause





