@echo off
REM Google Cloud 비용 확인 스크립트

chcp 65001 >nul
echo ============================================
echo    Google Cloud 비용 확인
echo ============================================
echo.

REM gcloud CLI 확인
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ gcloud CLI가 설치되지 않았습니다.
    pause
    exit /b 1
)

REM 현재 프로젝트 확인
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ 프로젝트가 설정되지 않았습니다.
    echo    gcloud config set project [PROJECT_ID] 실행하세요.
    pause
    exit /b 1
)

echo 현재 프로젝트: %PROJECT_ID%
echo.

echo ============================================
echo    1. Cloud SQL 인스턴스 확인
echo ============================================
echo.

gcloud sql instances list --format="table(name,region,tier,databaseVersion,state,ipAddresses[0].ipAddress)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Cloud SQL 인스턴스를 확인할 수 없습니다.
) else (
    echo.
    echo 💡 인스턴스가 실행 중이면 계속 과금됩니다!
    echo.
)

echo ============================================
echo    2. Compute Engine VM 확인
echo ============================================
echo.

gcloud compute instances list --format="table(name,zone,machineType,status,EXTERNAL_IP)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  VM 인스턴스를 확인할 수 없습니다.
) else (
    echo.
    echo 💡 VM이 실행 중이면 비용이 발생합니다!
    echo.
)

echo ============================================
echo    3. 활성화된 API 확인
echo ============================================
echo.

gcloud services list --enabled --format="table(name,title)" 2>nul | findstr /i "sql\|compute\|storage\|cloud" 
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  API 목록을 확인할 수 없습니다.
)

echo.
echo ============================================
echo    비용 확인 방법
echo ============================================
echo.
echo 1. Google Cloud Console에서 확인:
echo    https://console.cloud.google.com/billing
echo.
echo 2. 비용 분석:
echo    - Cloud SQL: 월 약 13,000-20,000원 (계속 실행 시)
echo    - Compute Engine VM: e2-micro는 무료, 더 큰 인스턴스는 과금
echo    - 네트워크: 외부 트래픽 발생 시 비용
echo    - 스토리지: 사용량에 따라 비용
echo.
echo 3. 즉시 비용 절감:
echo    - 사용하지 않는 인스턴스 중지 또는 삭제
echo    - Cloud SQL 인스턴스 중지
echo    - VM 인스턴스 중지
echo.
echo ============================================
echo    비용 상세 확인
echo ============================================
echo.
echo Cloud Console에서 더 자세한 비용을 확인하세요:
echo https://console.cloud.google.com/billing
echo.
echo 💡 주의: 무료 크레딧 $300이 있으면 그 안에서 차감됩니다.
echo.
pause

