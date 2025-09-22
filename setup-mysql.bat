@echo off
echo ========================================
echo    찹플랜 MySQL 데이터베이스 설정
echo ========================================
echo.

echo 1. MySQL 설치 확인 중...
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ MySQL이 설치되지 않았습니다.
    echo.
    echo 📥 설치 방법:
    echo    1. XAMPP 다운로드: https://www.apachefriends.org/download.html
    echo    2. 또는 MySQL 직접 설치: https://dev.mysql.com/downloads/mysql/
    echo.
    pause
    exit /b 1
)
echo ✅ MySQL 설치 확인됨

echo.
echo 2. MySQL 서비스 시작 중...
net start mysql80 >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  MySQL 서비스 시작 실패 (이미 실행 중일 수 있음)
)

echo.
echo 3. 데이터베이스 생성 중...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS choprest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ 데이터베이스 생성 실패
    echo    MySQL root 비밀번호를 입력하세요:
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS choprest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
)

echo.
echo 4. 사용자 생성 중...
mysql -u root -e "CREATE USER IF NOT EXISTS 'choprest'@'localhost' IDENTIFIED BY 'password123';" 2>nul
if %errorlevel% neq 0 (
    echo ❌ 사용자 생성 실패
    echo    MySQL root 비밀번호를 입력하세요:
    mysql -u root -p -e "CREATE USER IF NOT EXISTS 'choprest'@'localhost' IDENTIFIED BY 'password123';"
)

echo.
echo 5. 권한 부여 중...
mysql -u root -e "GRANT ALL PRIVILEGES ON choprest.* TO 'choprest'@'localhost'; FLUSH PRIVILEGES;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ 권한 부여 실패
    echo    MySQL root 비밀번호를 입력하세요:
    mysql -u root -p -e "GRANT ALL PRIVILEGES ON choprest.* TO 'choprest'@'localhost'; FLUSH PRIVILEGES;"
)

echo.
echo 6. 연결 테스트 중...
mysql -u choprest -ppassword123 -e "USE choprest; SHOW TABLES;" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ 데이터베이스 설정 완료!
) else (
    echo ⚠️  연결 테스트 실패 (비밀번호 확인 필요)
)

echo.
echo ========================================
echo    DBeaver 연결 정보:
echo    Host: localhost
echo    Port: 3306
echo    Database: choprest
echo    Username: choprest
echo    Password: password123
echo ========================================
echo.
echo 다음 단계:
echo 1. DBeaver에서 위 정보로 연결
echo 2. ./gradlew bootRun 으로 애플리케이션 실행
echo.
pause

