@echo off
REM 로컬 애플리케이션에서 Cloud SQL 연결 테스트

chcp 65001 >nul
echo ============================================
echo    로컬 → Cloud SQL 연결 테스트
echo ============================================
echo.

echo application-cloudsql.properties 파일 확인 중...
echo.

REM 설정 파일 확인
if not exist "src\main\resources\application-cloudsql.properties" (
    echo ❌ application-cloudsql.properties 파일이 없습니다.
    echo    먼저 설정 파일을 생성하세요.
    pause
    exit /b 1
)

echo ✅ 설정 파일 발견
echo.

REM Public IP 확인
set INSTANCE_NAME=chopplan-db
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set PUBLIC_IP=%%i

if "%PUBLIC_IP%"=="" (
    echo ❌ Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo Public IP: %PUBLIC_IP%
echo.

REM 설정 파일에서 연결 정보 확인
echo 설정 파일 내용 확인:
echo.
findstr /C:"spring.datasource.url" src\main\resources\application-cloudsql.properties
findstr /C:"spring.datasource.username" src\main\resources\application-cloudsql.properties
echo.

echo ============================================
echo    백엔드 연결 테스트
echo ============================================
echo.

echo 백엔드를 실행하여 연결을 테스트합니다.
echo.
echo 방법 1: 백엔드 실행 후 로그 확인
echo    gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
echo.
echo 방법 2: 간단한 연결 테스트
echo    test-cloudsql-connection.bat
echo.

set /p test_choice="백엔드를 실행하여 연결 테스트하시겠습니까? (Y/N): "

if /i "%test_choice%"=="Y" (
    echo.
    echo 백엔드 빌드 중...
    call gradlew.bat clean build -q
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 빌드 실패
        pause
        exit /b 1
    )
    
    echo ✅ 빌드 완료
    echo.
    echo 백엔드 실행 중... (Cloud SQL 연결 시도)
    echo 로그에서 연결 성공 메시지를 확인하세요:
    echo   - "HikariPool-1 - Start completed" (성공)
    echo   - "Connection refused" (실패)
    echo.
    echo Ctrl+C로 중지할 수 있습니다.
    echo.
    
    call gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
) else (
    echo.
    echo 수동으로 테스트하세요:
    echo   1. test-cloudsql-connection.bat (MySQL 직접 연결)
    echo   2. 백엔드 실행 후 로그 확인
)

echo.
pause

