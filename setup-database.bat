@echo off
echo ========================================
echo    찹플랜 데이터베이스 설정 스크립트
echo ========================================
echo.

echo 1. PostgreSQL 설치 확인 중...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL이 설치되지 않았습니다.
    echo    https://www.postgresql.org/download/windows/ 에서 설치하세요.
    pause
    exit /b 1
)
echo ✅ PostgreSQL 설치 확인됨

echo.
echo 2. 데이터베이스 생성 중...
psql -U postgres -c "CREATE DATABASE choprest;" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  데이터베이스가 이미 존재하거나 생성 실패
)

psql -U postgres -c "CREATE USER choprest WITH PASSWORD 'password123';" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  사용자가 이미 존재하거나 생성 실패
)

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE choprest TO choprest;" 2>nul
echo ✅ 데이터베이스 설정 완료

echo.
echo 3. DBeaver 연결 정보:
echo    Host: localhost
echo    Port: 5432
echo    Database: choprest
echo    Username: choprest
echo    Password: password123
echo.
echo 4. Spring Boot 설정 변경 필요:
echo    application.properties에서 H2를 PostgreSQL로 변경
echo.
echo ========================================
echo    설정 완료! DBeaver에서 연결하세요.
echo ========================================
pause

