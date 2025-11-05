@echo off
REM 빠른 해결 가이드

chcp 65001 >nul
echo ============================================
echo    빠진 항목 빠른 해결 가이드
echo ============================================
echo.

echo 현재 상황을 확인하고 해결 방법을 안내합니다.
echo.

REM gcloud CLI 확인
where gcloud >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ gcloud CLI가 설치되지 않았습니다.
    echo.
    echo 📥 설치 방법:
    echo    1. https://cloud.google.com/sdk/docs/install-sdk 접속
    echo    2. Windows용 다운로드
    echo    3. 설치 프로그램 실행
    echo    4. 설치 후 새로운 CMD 창 열기
    echo.
    echo ⚠️  gcloud CLI가 없으면 다음 단계를 진행할 수 없습니다.
    echo.
    pause
    exit /b 1
) else (
    echo ✅ gcloud CLI 설치됨
    echo.
    
    REM 로그인 확인
    gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ gcloud 로그인이 필요합니다.
        echo.
        echo 실행할 명령어:
        echo   gcloud auth login
        echo.
        echo 브라우저가 열리면 Google 계정으로 로그인하세요.
        echo.
    ) else (
        echo ✅ gcloud 로그인됨
        echo.
    )
    
    REM 프로젝트 확인
    for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT=%%i
    if "%PROJECT%"=="" (
        echo ❌ 프로젝트가 설정되지 않았습니다.
        echo.
        echo 실행할 명령어:
        echo   gcloud config set project [YOUR_PROJECT_ID]
        echo.
        echo 프로젝트 ID는 Cloud Console에서 확인하세요:
        echo   https://console.cloud.google.com
        echo.
    ) else (
        echo ✅ 프로젝트 설정됨: %PROJECT%
        echo.
    )
)

echo ============================================
echo.
echo 📋 다음 단계:
echo.
echo   1. fix-gcp-missing-items.bat 실행
echo      → API 활성화 및 리소스 생성 안내
echo.
echo   2. FIX_MISSING_ITEMS_GUIDE.md 참고
echo      → 단계별 상세 가이드
echo.
echo   3. 모든 항목 체크 후:
echo      - setup-gcp-compute-engine-vm.bat
echo      - setup-gcp-connection-info.bat
echo      - deploy-gcp-compute-engine.bat
echo.
pause



