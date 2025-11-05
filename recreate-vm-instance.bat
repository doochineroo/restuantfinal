@echo off
REM VM 인스턴스 삭제 후 새로 생성 스크립트

chcp 65001 >nul
setlocal enabledelayedexpansion
echo ============================================
echo    VM 인스턴스 삭제 및 재생성
echo ============================================
echo.
echo ⚠️  주의: 기존 인스턴스의 모든 데이터가 삭제됩니다!
echo.

REM 프로젝트 확인
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ 프로젝트가 설정되지 않았습니다.
    set /p PROJECT_ID="프로젝트 ID: "
    if "!PROJECT_ID!"=="" (
        echo ❌ 프로젝트 ID를 입력해야 합니다.
        pause
        exit /b 1
    )
    gcloud config set project !PROJECT_ID!
)

echo 현재 프로젝트: !PROJECT_ID!
echo.

REM 인스턴스 정보 확인
set /p INSTANCE_NAME="인스턴스 이름 (기본: chopplan-server): "
if "%INSTANCE_NAME%"=="" set INSTANCE_NAME=chopplan-server

set /p ZONE="리전-존 (기본: us-west1-a): "
if "%ZONE%"=="" set ZONE=us-west1-a

echo.
echo ============================================
echo    기존 인스턴스 확인
echo ============================================
echo.

REM 인스턴스 존재 확인
gcloud compute instances describe %INSTANCE_NAME% --zone=%ZONE% >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  인스턴스 '%INSTANCE_NAME%'를 찾을 수 없습니다.
    echo    새 인스턴스를 생성합니다.
    echo.
    goto :CREATE_NEW
)

echo 인스턴스 정보:
gcloud compute instances describe %INSTANCE_NAME% --zone=%ZONE% --format="table(name,zone,machineType,status,networkInterfaces[0].accessConfigs[0].natIP)"
echo.

REM 데이터 백업 안내
echo ============================================
echo    데이터 백업 안내
echo ============================================
echo.
echo ⚠️  인스턴스 삭제 전에 다음 데이터를 백업하세요:
echo.
echo 1. 데이터베이스 백업:
echo    gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="mysqldump -u root -pchopplan123 chopplan > ~/chopplan_backup.sql"
echo    gcloud compute scp %INSTANCE_NAME%:~/chopplan_backup.sql . --zone=%ZONE%
echo.
echo 2. 애플리케이션 파일 백업 (선택사항):
echo    gcloud compute scp %INSTANCE_NAME%:~/chopplan/*.jar . --zone=%ZONE%
echo.
echo 3. 설정 파일 백업 (선택사항):
echo    gcloud compute scp %INSTANCE_NAME%:~/chopplan/*.properties . --zone=%ZONE%
echo.
echo ============================================
echo.

set /p CONFIRM="정말 삭제하고 새로 만들까요? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.

REM 기존 인스턴스 삭제
echo ============================================
echo    [1/3] 기존 인스턴스 삭제 중...
echo ============================================
echo.

gcloud compute instances delete %INSTANCE_NAME% --zone=%ZONE% --quiet
if %errorlevel% neq 0 (
    echo ❌ 인스턴스 삭제 실패
    pause
    exit /b 1
)

echo ✅ 인스턴스 삭제 완료
echo.
timeout /t 3 >nul

REM 새 인스턴스 생성
:CREATE_NEW
echo ============================================
echo    [2/3] 새 인스턴스 생성 중...
echo ============================================
echo.

echo 인스턴스 설정:
echo   이름: %INSTANCE_NAME%
echo   존: %ZONE%
echo   머신 유형: e2-micro
echo   디스크: 30GB
echo   운영체제: Ubuntu 22.04 LTS
echo.

gcloud compute instances create %INSTANCE_NAME% ^
    --zone=%ZONE% ^
    --machine-type=e2-micro ^
    --boot-disk-size=30GB ^
    --image-family=ubuntu-2204-lts ^
    --image-project=ubuntu-os-cloud ^
    --tags=http-server,https-server

if %errorlevel% neq 0 (
    echo ❌ 인스턴스 생성 실패
    pause
    exit /b 1
)

echo ✅ 인스턴스 생성 완료
echo.
timeout /t 5 >nul

REM 초기 설정
echo ============================================
echo    [3/3] 초기 설정 중...
echo ============================================
echo.

echo [3-1] 시스템 업데이트 및 Java 설치...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="sudo apt update && sudo apt upgrade -y && sudo apt install openjdk-17-jdk -y" --quiet

if %errorlevel% neq 0 (
    echo ⚠️  Java 설치 실패 (나중에 다시 시도 가능)
) else (
    echo ✅ Java 설치 완료
)
echo.

echo [3-2] MySQL 설치...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="sudo apt install mysql-server -y" --quiet

if %errorlevel% neq 0 (
    echo ⚠️  MySQL 설치 실패 (나중에 다시 시도 가능)
) else (
    echo ✅ MySQL 설치 완료
    echo.
    echo [3-3] MySQL 초기 설정...
    gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="sudo mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'chopplan123';\" && sudo mysql -e \"FLUSH PRIVILEGES;\"" --quiet
    gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="sudo mysql -u root -pchopplan123 -e 'CREATE DATABASE IF NOT EXISTS chopplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'" --quiet
    echo ✅ MySQL 설정 완료
)
echo.

echo [3-4] 애플리케이션 디렉토리 생성...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="mkdir -p ~/chopplan/static" --quiet
echo ✅ 디렉토리 생성 완료
echo.

REM 외부 IP 확인
echo ============================================
echo    인스턴스 정보
echo ============================================
echo.

for /f "tokens=*" %%i in ('gcloud compute instances describe %INSTANCE_NAME% --zone=%ZONE% --format="get(networkInterfaces[0].accessConfigs[0].natIP)"') do set EXTERNAL_IP=%%i

echo 인스턴스 이름: %INSTANCE_NAME%
echo 존: %ZONE%
echo 외부 IP: !EXTERNAL_IP!
echo.

echo ============================================
echo    다음 단계
echo ============================================
echo.
echo 1. 데이터베이스 백업 복원 (백업이 있다면):
echo    gcloud compute scp chopplan_backup.sql %INSTANCE_NAME%:~/ --zone=%ZONE%
echo    gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="mysql -u root -pchopplan123 chopplan < ~/chopplan_backup.sql"
echo.
echo 2. 애플리케이션 배포:
echo    deploy-gcp-compute-engine.bat
echo    또는
echo    fast-upload.bat
echo.
echo 3. 방화벽 규칙 확인 (필요시):
echo    gcloud compute firewall-rules list --filter="name:allow-http-8080"
echo.
echo ============================================
echo    완료!
echo ============================================
echo.

pause

