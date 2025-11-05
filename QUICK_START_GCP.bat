@echo off
REM Google Cloud 빠른 배포 가이드

chcp 65001 >nul
echo ============================================
echo    Google Cloud 빠른 배포 가이드
echo ============================================
echo.

echo 📋 배포 순서:
echo.
echo    1. Cloud SQL 인스턴스 생성 및 데이터 마이그레이션
echo       → setup-gcp-cloud-sql.md 참고
echo.
echo    2. Compute Engine VM 생성 (Cloud Console 또는 gcloud CLI)
echo       → GCP_COMPLETE_DEPLOYMENT_GUIDE.md 참고
echo.
echo    3. VM 초기 설정
echo       → setup-gcp-compute-engine-vm.bat 실행
echo.
echo    4. 연결 정보 설정
echo       → setup-gcp-connection-info.bat 실행
echo.
echo    5. 애플리케이션 배포
echo       → deploy-gcp-compute-engine.bat 실행
echo.
echo    6. 방화벽 규칙 설정
echo       → gcloud compute firewall-rules create allow-http-8080 --allow tcp:8080
echo.
echo ============================================
echo.

set /p STEP="진행할 단계 번호 (1-6, 또는 'all'): "

if "%STEP%"=="1" (
    echo Cloud SQL 설정은 setup-gcp-cloud-sql.md를 참고하세요.
    pause
    exit /b 0
)

if "%STEP%"=="2" (
    echo Compute Engine VM 생성을 시작합니다...
    echo.
    echo Cloud Console에서:
    echo   - Compute Engine ^> VM 인스턴스 ^> 인스턴스 만들기
    echo   - 이름: chopplan-server
    echo   - 머신 유형: e2-micro
    echo   - 리전: us-west1 (무료) 또는 asia-northeast2
    echo.
    pause
    exit /b 0
)

if "%STEP%"=="3" (
    echo VM 초기 설정을 시작합니다...
    call setup-gcp-compute-engine-vm.bat
    exit /b 0
)

if "%STEP%"=="4" (
    echo 연결 정보 설정을 시작합니다...
    call setup-gcp-connection-info.bat
    exit /b 0
)

if "%STEP%"=="5" (
    echo 애플리케이션 배포를 시작합니다...
    call deploy-gcp-compute-engine.bat
    exit /b 0
)

if "%STEP%"=="6" (
    echo 방화벽 규칙을 생성합니다...
    gcloud compute firewall-rules create allow-http-8080 --allow tcp:8080 --source-ranges 0.0.0.0/0 --description "Allow HTTP port 8080"
    if %errorlevel% equ 0 (
        echo ✅ 방화벽 규칙 생성 완료!
    ) else (
        echo ⚠️  방화벽 규칙이 이미 존재하거나 오류가 발생했습니다.
    )
    pause
    exit /b 0
)

if "%STEP%"=="all" (
    echo 전체 배포 과정을 시작합니다...
    echo.
    echo Step 3: VM 초기 설정...
    call setup-gcp-compute-engine-vm.bat
    echo.
    echo Step 4: 연결 정보 설정...
    call setup-gcp-connection-info.bat
    echo.
    echo Step 5: 애플리케이션 배포...
    call deploy-gcp-compute-engine.bat
    echo.
    echo Step 6: 방화벽 규칙 생성...
    gcloud compute firewall-rules create allow-http-8080 --allow tcp:8080 --source-ranges 0.0.0.0/0 --description "Allow HTTP port 8080" 2>nul
    echo.
    echo ✅ 전체 배포 완료!
    pause
    exit /b 0
)

echo ❌ 잘못된 선택입니다.
pause



