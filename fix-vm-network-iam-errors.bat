@echo off
REM VM Network Management API 및 IAM 권한 오류 해결 스크립트

chcp 65001 >nul
setlocal enabledelayedexpansion
echo ============================================
echo    VM Network Management API 및 IAM 권한 오류 해결
echo ============================================
echo.

REM 프로젝트 확인
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ 프로젝트가 설정되지 않았습니다.
    echo.
    echo 📋 프로젝트 ID를 입력하세요.
    set /p PROJECT_ID="프로젝트 ID: "
    if "!PROJECT_ID!"=="" (
        echo ❌ 프로젝트 ID를 입력해야 합니다.
        pause
        exit /b 1
    )
    gcloud config set project !PROJECT_ID!
    echo ✅ 프로젝트 설정 완료: !PROJECT_ID!
    echo.
) else (
    set PROJECT_ID=%PROJECT_ID%
)

echo 현재 프로젝트: !PROJECT_ID!
echo.

REM 1. Network Management API 활성화
echo [1/3] Network Management API 활성화 중...
gcloud services enable networkmanagement.googleapis.com --project=!PROJECT_ID!
if %errorlevel% equ 0 (
    echo ✅ Network Management API 활성화 완료
) else (
    echo ⚠️  Network Management API 활성화 실패 또는 이미 활성화됨
)
echo.

REM 2. Compute Engine API 활성화 (필요한 경우)
echo [2/3] Compute Engine API 확인 중...
gcloud services enable compute.googleapis.com --project=!PROJECT_ID!
if %errorlevel% equ 0 (
    echo ✅ Compute Engine API 활성화 완료
) else (
    echo ⚠️  Compute Engine API는 이미 활성화되어 있습니다
)
echo.

REM 3. IAM 권한 확인
echo [3/3] IAM 권한 확인 중...
echo.
echo 현재 사용자 계정:
gcloud auth list
echo.
echo 현재 프로젝트의 IAM 권한 확인:
gcloud projects get-iam-policy !PROJECT_ID! --flatten="bindings[].members" --filter="bindings.members:user:$(gcloud config get-value account)" --format="table(bindings.role)"
echo.

REM 4. 필요한 역할 확인 및 안내
echo ============================================
echo    필요한 IAM 역할 확인
echo ============================================
echo.
echo 다음 역할들이 필요합니다:
echo.
echo 1. Compute Engine Admin (compute.admin)
echo    - VM 인스턴스 관리 권한
echo.
echo 2. Compute Network Admin (compute.networkAdmin)
echo    - 네트워크 설정 권한
echo.
echo 3. Service Account User (iam.serviceAccountUser)
echo    - 서비스 계정 사용 권한
echo.
echo ============================================
echo    권한 부여 방법
echo ============================================
echo.
echo 방법 1: Cloud Console에서 (추천)
echo    1. https://console.cloud.google.com/iam-admin/iam?project=!PROJECT_ID!
echo    2. 현재 사용자 계정 찾기
echo    3. 연필 아이콘 클릭
echo    4. 다음 역할 추가:
echo       - Compute Engine Admin
echo       - Compute Network Admin
echo       - Service Account User
echo    5. 저장
echo.
echo 방법 2: gcloud CLI로 (프로젝트 소유자 권한 필요)
echo    gcloud projects add-iam-policy-binding !PROJECT_ID! ^
echo        --member="user:$(gcloud config get-value account)" ^
echo        --role="roles/compute.admin"
echo.
echo    gcloud projects add-iam-policy-binding !PROJECT_ID! ^
echo        --member="user:$(gcloud config get-value account)" ^
echo        --role="roles/compute.networkAdmin"
echo.
echo    gcloud projects add-iam-policy-binding !PROJECT_ID! ^
echo        --member="user:$(gcloud config get-value account)" ^
echo        --role="roles/iam.serviceAccountUser"
echo.
echo ============================================
echo    API 활성화 확인
echo ============================================
echo.
echo 활성화된 API 목록 확인 중...
gcloud services list --enabled --project=!PROJECT_ID! --filter="name:networkmanagement.googleapis.com OR name:compute.googleapis.com" --format="table(name,title)"
echo.

REM 5. API 활성화 대기 안내
echo ============================================
echo    중요 안내
echo ============================================
echo.
echo API를 활성화한 후 몇 분 정도 기다려야 합니다.
echo 일반적으로 1-3분 정도 소요됩니다.
echo.
echo 만약 여전히 오류가 발생하면:
echo    1. 2-3분 대기 후 다시 시도
echo    2. Cloud Console에서 API 활성화 확인:
echo       https://console.developers.google.com/apis/api/networkmanagement.googleapis.com/overview?project=!PROJECT_ID!
echo    3. IAM 권한 확인:
echo       https://console.cloud.google.com/iam-admin/iam?project=!PROJECT_ID!
echo.

echo ============================================
echo    완료!
echo ============================================
echo.
echo 다음 단계:
echo    1. API 활성화가 완료될 때까지 2-3분 대기
echo    2. IAM 권한이 부여되었는지 확인
echo    3. VM 명령어 다시 실행
echo.

pause

