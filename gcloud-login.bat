@echo off
REM Google Cloud 로그인 가이드 스크립트

chcp 65001 >nul
echo ============================================
echo    Google Cloud 로그인 가이드
echo ============================================
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
    pause
    exit /b 1
)

echo ✅ gcloud CLI 설치됨
echo.

REM 현재 로그인 상태 확인
echo 현재 로그인 상태 확인 중...
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 이미 로그인되어 있습니다!
    echo.
    echo 현재 로그인된 계정:
    gcloud auth list --filter=status:ACTIVE --format="value(account)"
    echo.
    
    REM 프로젝트 확인
    for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT=%%i
    if "%PROJECT%"=="" (
        echo ⚠️  프로젝트가 설정되지 않았습니다.
        echo.
        echo 프로젝트 설정 방법:
        echo   1. Cloud Console에서 프로젝트 ID 확인
        echo      https://console.cloud.google.com
        echo   2. 다음 명령어 실행:
        echo      gcloud config set project [PROJECT_ID]
        echo.
        echo 또는:
        echo   set-gcp-project.bat 실행
        echo.
    ) else (
        echo ✅ 프로젝트 설정됨: %PROJECT%
        echo.
    )
    
    echo 현재 설정:
    gcloud config list
    echo.
    pause
    exit /b 0
)

echo ❌ 로그인되지 않았습니다.
echo.
echo 로그인을 시작합니다...
echo 브라우저가 자동으로 열리면 Google 계정으로 로그인하세요.
echo.
pause

gcloud auth login

if %errorlevel% equ 0 (
    echo.
    echo ✅ 로그인 완료!
    echo.
    echo 로그인된 계정:
    gcloud auth list --filter=status:ACTIVE --format="value(account)"
    echo.
    
    REM 프로젝트 설정 안내
    for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT=%%i
    if "%PROJECT%"=="" (
        echo ⚠️  프로젝트를 설정해야 합니다.
        echo.
        echo 다음 중 선택하세요:
        echo   1. set-gcp-project.bat 실행
        echo   2. 수동: gcloud config set project [PROJECT_ID]
        echo.
    ) else (
        echo ✅ 프로젝트 설정됨: %PROJECT%
        echo.
    )
) else (
    echo.
    echo ❌ 로그인 실패
    echo.
    echo 문제 해결:
    echo   1. 인터넷 연결 확인
    echo   2. 브라우저에서 수동으로 URL 입력
    echo   3. Google 계정 권한 확인
    echo.
)

pause



