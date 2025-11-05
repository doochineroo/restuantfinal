@echo off
REM Google Cloud 프로젝트 설정 스크립트

chcp 65001 >nul
echo ============================================
echo    Google Cloud 프로젝트 설정
echo ============================================
echo.

echo 📋 프로젝트 ID는 Cloud Console에서 확인할 수 있습니다:
echo    https://console.cloud.google.com
echo    상단 프로젝트 선택 드롭다운에서 프로젝트 ID 확인
echo.

set /p PROJECT_ID="프로젝트 ID를 입력하세요: "

if "%PROJECT_ID%"=="" (
    echo ❌ 프로젝트 ID를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo 프로젝트 설정 중...
gcloud config set project %PROJECT_ID%

if %errorlevel% equ 0 (
    echo ✅ 프로젝트 설정 완료: %PROJECT_ID%
    echo.
    echo 확인:
    gcloud config get-value project
    echo.
) else (
    echo ❌ 프로젝트 설정 실패.
    echo.
    echo 가능한 원인:
    echo   1. 프로젝트 ID가 잘못되었습니다
    echo   2. 프로젝트에 대한 접근 권한이 없습니다
    echo   3. gcloud CLI가 로그인되지 않았습니다 (gcloud auth login 실행)
    echo.
)

pause



