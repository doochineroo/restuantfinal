@echo off
REM Google Cloud 빠진 항목 자동 설정 스크립트

chcp 65001 >nul
setlocal enabledelayedexpansion
echo ============================================
echo    Google Cloud 빠진 항목 자동 설정
echo ============================================
echo.

REM 프로젝트 확인
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ 프로젝트가 설정되지 않았습니다.
    echo.
    echo 📋 프로젝트 ID는 Cloud Console에서 확인할 수 있습니다:
    echo    https://console.cloud.google.com
    echo    상단 프로젝트 선택 드롭다운에서 프로젝트 ID 확인
    echo.
    set /p PROJECT_ID="프로젝트 ID를 입력하세요: "
    if "!PROJECT_ID!"=="" (
        echo ❌ 프로젝트 ID를 입력해야 합니다.
        pause
        exit /b 1
    )
    gcloud config set project !PROJECT_ID!
    if %errorlevel% equ 0 (
        echo ✅ 프로젝트 설정 완료: !PROJECT_ID!
    ) else (
        echo ❌ 프로젝트 설정 실패. 프로젝트 ID를 확인하세요.
        pause
        exit /b 1
    )
    echo.
) else (
    set PROJECT_ID=%PROJECT_ID%
)

echo 현재 프로젝트: !PROJECT_ID!
echo.

REM 1. Compute Engine API 활성화
echo [1/4] Compute Engine API 활성화 중...
gcloud services enable compute.googleapis.com
if %errorlevel% equ 0 (
    echo ✅ Compute Engine API 활성화 완료
) else (
    echo ⚠️  Compute Engine API 활성화 실패 (이미 활성화되었을 수 있음)
)
echo.

REM 2. Cloud SQL Admin API 활성화
echo [2/4] Cloud SQL Admin API 활성화 중...
gcloud services enable sqladmin.googleapis.com
if %errorlevel% equ 0 (
    echo ✅ Cloud SQL Admin API 활성화 완료
) else (
    echo ⚠️  Cloud SQL Admin API 활성화 실패 (이미 활성화되었을 수 있음)
)
echo.

REM 3. Cloud SQL 인스턴스 확인 및 생성 옵션
echo [3/4] Cloud SQL 인스턴스 확인 중...
gcloud sql instances list --format="value(name)" > temp_sql.txt 2>nul
set /a SQL_COUNT=0
for /f %%i in (temp_sql.txt) do set /a SQL_COUNT+=1
del temp_sql.txt

if %SQL_COUNT% equ 0 (
    echo ⚠️  Cloud SQL 인스턴스가 없습니다.
    echo.
    echo Cloud SQL 인스턴스를 생성하시겠습니까?
    echo   1. 예 - Cloud Console에서 수동 생성 안내
    echo   2. 아니오 - 나중에 생성
    set /p CREATE_SQL="선택 (1 또는 2): "
    
    if "%CREATE_SQL%"=="1" (
        echo.
        echo 📋 Cloud SQL 인스턴스 생성 방법:
        echo.
        echo   1. https://console.cloud.google.com/sql 접속
        echo   2. "인스턴스 만들기" 클릭
        echo   3. MySQL 선택
        echo   4. 설정:
        echo      - 인스턴스 ID: chopplan-db
        echo      - 리전: asia-northeast2 (서울)
        echo      - 머신 유형: db-f1-micro
        echo      - 비밀번호 설정
        echo   5. "만들기" 클릭
        echo.
        echo 가이드: setup-gcp-cloud-sql.md 참고
        echo.
    )
) else (
    echo ✅ Cloud SQL 인스턴스 발견 (%SQL_COUNT%개)
    gcloud sql instances list
    echo.
)

REM 4. Compute Engine VM 확인 및 생성 옵션
echo [4/4] Compute Engine VM 확인 중...
gcloud compute instances list --format="value(name)" > temp_vm.txt 2>nul
set /a VM_COUNT=0
for /f %%i in (temp_vm.txt) do set /a VM_COUNT+=1
del temp_vm.txt

if %VM_COUNT% equ 0 (
    echo ⚠️  Compute Engine VM이 없습니다.
    echo.
    echo VM 인스턴스를 생성하시겠습니까?
    echo   1. 예 - gcloud CLI로 자동 생성
    echo   2. 예 - Cloud Console에서 수동 생성 안내
    echo   3. 아니오 - 나중에 생성
    set /p CREATE_VM="선택 (1, 2 또는 3): "
    
    if "%CREATE_VM%"=="1" (
        echo.
        set /p VM_NAME="VM 인스턴스 이름 (기본: chopplan-server): "
        if "%VM_NAME%"=="" set VM_NAME=chopplan-server
        
        set /p ZONE="리전-존 (예: us-west1-a 또는 asia-northeast2-a): "
        if "%ZONE%"=="" (
            echo ❌ 존을 입력해야 합니다.
            pause
            exit /b 1
        )
        
        echo.
        echo VM 인스턴스 생성 중...
        gcloud compute instances create %VM_NAME% ^
            --zone=%ZONE% ^
            --machine-type=e2-micro ^
            --boot-disk-size=30GB ^
            --image-family=ubuntu-2204-lts ^
            --image-project=ubuntu-os-cloud ^
            --tags=http-server,https-server
        
        if %errorlevel% equ 0 (
            echo ✅ VM 인스턴스 생성 완료!
        ) else (
            echo ❌ VM 인스턴스 생성 실패
        )
    ) else if "%CREATE_VM%"=="2" (
        echo.
        echo 📋 Cloud Console에서 VM 생성 방법:
        echo.
        echo   1. https://console.cloud.google.com/compute/instances 접속
        echo   2. "인스턴스 만들기" 클릭
        echo   3. 설정:
        echo      - 이름: chopplan-server
        echo      - 리전: us-west1 (무료) 또는 asia-northeast2 (서울)
        echo      - 머신 유형: e2-micro
        echo      - 운영체제: Ubuntu 22.04 LTS
        echo      - 방화벽: HTTP, HTTPS 트래픽 허용
        echo   4. "만들기" 클릭
        echo.
    )
) else (
    echo ✅ VM 인스턴스 발견 (%VM_COUNT%개)
    gcloud compute instances list
    echo.
)

echo.
echo ============================================
echo ✅ 설정 완료!
echo ============================================
echo.
echo 다음 단계:
if %SQL_COUNT% equ 0 (
    echo   1. Cloud SQL 인스턴스 생성 (아직 안 했다면)
)
if %VM_COUNT% equ 0 (
    echo   2. VM 인스턴스 생성 (아직 안 했다면)
)
echo   3. check-gcp-prerequisites.bat 다시 실행하여 확인
echo   4. setup-gcp-compute-engine-vm.bat 실행
echo   5. setup-gcp-connection-info.bat 실행
echo   6. deploy-gcp-compute-engine.bat 실행
echo.

pause

