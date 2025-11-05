@echo off
REM application-cloudsql.properties 자동 업데이트

chcp 65001 >nul
echo ============================================
echo    application-cloudsql.properties 업데이트
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

REM Public IP 확인
echo Cloud SQL Public IP 확인 중...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set PUBLIC_IP=%%i

if "%PUBLIC_IP%"=="" (
    echo ❌ Public IP를 찾을 수 없습니다.
    echo    먼저 Cloud SQL 인스턴스를 확인하세요.
    pause
    exit /b 1
)

echo ✅ Public IP: %PUBLIC_IP%
echo.

REM 비밀번호 입력
echo Cloud SQL root 비밀번호를 입력하세요:
set /p DB_PASSWORD="비밀번호: "

if "%DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    설정 파일 업데이트
echo ============================================
echo.

set PROPERTIES_FILE=src\main\resources\application-cloudsql.properties

if not exist "%PROPERTIES_FILE%" (
    echo ❌ application-cloudsql.properties 파일이 없습니다.
    pause
    exit /b 1
)

echo 설정 파일 업데이트 중...
echo.

REM 임시 파일 생성
set TEMP_FILE=%TEMP%\application-cloudsql-temp.properties

REM URL 업데이트
powershell -Command "(Get-Content '%PROPERTIES_FILE%') -replace 'jdbc:mysql://\[CLOUD_SQL_PUBLIC_IP\]:3306', 'jdbc:mysql://%PUBLIC_IP%:3306' | Set-Content '%TEMP_FILE%'"

REM 비밀번호 업데이트
powershell -Command "(Get-Content '%TEMP_FILE%') -replace 'spring.datasource.password=\[YOUR_CLOUD_SQL_PASSWORD\]', 'spring.datasource.password=%DB_PASSWORD%' | Set-Content '%PROPERTIES_FILE%'"

del %TEMP_FILE% 2>nul

echo ✅ 설정 파일 업데이트 완료!
echo.
echo 변경된 내용:
echo   Public IP: %PUBLIC_IP%
echo   Password: [설정됨]
echo.

echo ============================================
echo    설정 확인
echo ============================================
echo.

findstr /C:"spring.datasource.url" "%PROPERTIES_FILE%"
findstr /C:"spring.datasource.username" "%PROPERTIES_FILE%"
echo spring.datasource.password=[설정됨]
echo.

echo ============================================
echo    다음 단계
echo ============================================
echo.
echo 이제 다음 명령어로 실행하세요:
echo   quick-test-local-cloudsql.bat
echo.
echo 또는:
echo   gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
echo.

pause

