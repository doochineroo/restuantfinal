@echo off
REM Google Cloud 배포 전 필수 사항 체크 스크립트

chcp 65001 >nul
echo ============================================
echo    Google Cloud 배포 전 필수 사항 체크
echo ============================================
echo.

set ALL_OK=1

REM 1. gcloud CLI 설치 확인
echo [1/5] gcloud CLI 설치 확인 중...
gcloud --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ gcloud CLI가 설치되지 않았습니다.
    echo    다운로드: https://cloud.google.com/sdk/docs/install
    echo.
    set ALL_OK=0
) else (
    echo ✅ gcloud CLI 설치됨
    gcloud --version | findstr /C:"Google Cloud SDK"
    echo.
)

REM 2. gcloud 로그인 확인
echo [2/5] gcloud 로그인 확인 중...
gcloud auth list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ gcloud 로그인이 필요합니다.
    echo    실행: gcloud auth login
    echo.
    set ALL_OK=0
) else (
    echo ✅ gcloud 로그인됨
    for /f "tokens=*" %%i in ('gcloud auth list --filter=status:ACTIVE --format="value(account)"') do set ACTIVE_ACCOUNT=%%i
    echo    계정: %ACTIVE_ACCOUNT%
    echo.
)

REM 3. 프로젝트 설정 확인
echo [3/5] 프로젝트 설정 확인 중...
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ 프로젝트가 설정되지 않았습니다.
    echo    실행: gcloud config set project [YOUR_PROJECT_ID]
    echo.
    set ALL_OK=0
) else (
    echo ✅ 프로젝트 설정됨
    echo    프로젝트 ID: %PROJECT_ID%
    echo.
)

REM 4. Cloud SQL 인스턴스 확인
echo [4/5] Cloud SQL 인스턴스 확인 중...
gcloud sql instances list --format="value(name)" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cloud SQL API가 활성화되지 않았거나 인스턴스가 없습니다.
    echo    실행: gcloud services enable sqladmin.googleapis.com
    echo    또는 Cloud Console에서 Cloud SQL 인스턴스를 생성하세요.
    echo.
    set ALL_OK=0
) else (
    for /f "tokens=*" %%i in ('gcloud sql instances list --format="value(name)"') do (
        echo ✅ Cloud SQL 인스턴스 발견: %%i
    )
    echo.
)

REM 5. Compute Engine VM 확인
echo [5/5] Compute Engine VM 확인 중...
gcloud compute instances list --format="value(name)" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Compute Engine API가 활성화되지 않았거나 VM이 없습니다.
    echo    실행: gcloud services enable compute.googleapis.com
    echo    또는 Cloud Console에서 VM 인스턴스를 생성하세요.
    echo.
    set ALL_OK=0
) else (
    for /f "tokens=*" %%i in ('gcloud compute instances list --format="value(name)"') do (
        echo ✅ VM 인스턴스 발견: %%i
    )
    echo.
)

echo ============================================
if %ALL_OK% equ 1 (
    echo ✅ 모든 필수 사항이 준비되었습니다!
    echo.
    echo 다음 단계:
    echo    1. setup-gcp-compute-engine-vm.bat 실행
    echo    2. setup-gcp-connection-info.bat 실행
    echo    3. deploy-gcp-compute-engine.bat 실행
    echo.
) else (
    echo ⚠️  일부 항목이 빠져있습니다.
    echo    위의 체크리스트를 확인하고 설정하세요.
    echo.
    echo 가이드 문서:
    echo    - GCP_PRE_REQUIREMENTS_CHECKLIST.md
    echo    - setup-gcp-cloud-sql.md
    echo    - GCP_COMPLETE_DEPLOYMENT_GUIDE.md
    echo.
)
echo ============================================
echo.

pause



