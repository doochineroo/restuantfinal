@echo off
REM Cloud SQL 연결 문제 진단 및 해결

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 연결 문제 진단 및 해결
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

echo [1/6] 인스턴스 상태 확인...
gcloud sql instances describe %INSTANCE_NAME% --format="value(state)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 인스턴스를 찾을 수 없습니다.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(state)" 2^>nul') do set INSTANCE_STATE=%%i

if "%INSTANCE_STATE%"=="RUNNABLE" (
    echo ✅ 인스턴스 상태: RUNNABLE (정상)
) else (
    echo ⚠️  인스턴스 상태: %INSTANCE_STATE%
    echo    인스턴스가 준비될 때까지 기다려야 합니다.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/6] Public IP 확인...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set PUBLIC_IP=%%i

if "%PUBLIC_IP%"=="" (
    echo ❌ Public IP가 없습니다.
    echo.
    echo Public IP를 추가합니다...
    gcloud sql instances patch %INSTANCE_NAME% --assign-ip --quiet
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Public IP 추가 완료
        timeout /t 10 /nobreak >nul
        for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set PUBLIC_IP=%%i
    ) else (
        echo ❌ Public IP 추가 실패
        pause
        exit /b 1
    )
) else (
    echo ✅ Public IP: %PUBLIC_IP%
)

echo.
echo [3/6] 현재 IP 확인...
powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content" > temp_ip.txt
set /p CURRENT_IP=<temp_ip.txt
del temp_ip.txt
echo 현재 IP: %CURRENT_IP%

echo.
echo [4/6] 승인된 네트워크 확인...
gcloud sql instances describe %INSTANCE_NAME% --format="value(settings.ipConfiguration.authorizedNetworks[].value)" 2>nul | findstr /i "%CURRENT_IP%" >nul

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  현재 IP가 승인된 네트워크에 없습니다.
    echo.
    set /p add_ip="현재 IP를 승인된 네트워크에 추가하시겠습니까? (Y/N): "
    
    if /i "%add_ip%"=="Y" (
        echo.
        echo 현재 IP를 추가합니다...
        gcloud sql instances patch %INSTANCE_NAME% --authorized-networks=%CURRENT_IP%/32 --quiet
        
        if %ERRORLEVEL% EQU 0 (
            echo ✅ IP 추가 완료: %CURRENT_IP%
            timeout /t 5 /nobreak >nul
        ) else (
            echo ⚠️  IP 추가 실패 (이미 추가되었을 수 있음)
        )
    )
) else (
    echo ✅ 현재 IP가 승인된 네트워크에 있습니다
)

echo.
echo [5/6] 데이터베이스 확인...
gcloud sql databases list --instance=%INSTANCE_NAME% --format="value(name)" 2>nul | findstr /i "chopplan" >nul

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  chopplan 데이터베이스가 없습니다.
    echo.
    set /p create_db="데이터베이스를 생성하시겠습니까? (Y/N): "
    
    if /i "%create_db%"=="Y" (
        echo.
        echo 데이터베이스 생성 중...
        gcloud sql databases create chopplan --instance=%INSTANCE_NAME% --charset=utf8mb4 --collation=utf8mb4_unicode_ci --quiet
        
        if %ERRORLEVEL% EQU 0 (
            echo ✅ 데이터베이스 생성 완료
        ) else (
            echo ❌ 데이터베이스 생성 실패
        )
    )
) else (
    echo ✅ chopplan 데이터베이스 확인됨
)

echo.
echo [6/6] 연결 정보 요약
echo ============================================
echo.
echo Public IP: %PUBLIC_IP%
echo 현재 IP: %CURRENT_IP%
echo 데이터베이스: chopplan
echo.
echo ============================================
echo    연결 테스트
echo ============================================
echo.

echo 비밀번호를 입력하여 연결을 테스트합니다:
set /p DB_PASSWORD="비밀번호: "

if "%DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo 연결 테스트 중...
mysql -h %PUBLIC_IP% -u root -p%DB_PASSWORD% chopplan -e "SELECT 'Connection OK' AS Status;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 연결 성공!
    echo.
    echo 연결 정보:
    echo   Host: %PUBLIC_IP%
    echo   Port: 3306
    echo   Database: chopplan
    echo   Username: root
    echo.
    echo 이제 application-cloudsql.properties에 설정하세요:
    echo   spring.datasource.url=jdbc:mysql://%PUBLIC_IP%:3306/chopplan?...
) else (
    echo.
    echo ❌ 연결 실패
    echo.
    echo 추가 확인:
    echo   1. 비밀번호가 정확한지 확인
    echo   2. 방화벽 설정 확인
    echo   3. 인스턴스가 완전히 준비되었는지 확인
    echo.
    echo 수동 확인:
    echo   mysql -h %PUBLIC_IP% -u root -p chopplan
)

echo.
pause

