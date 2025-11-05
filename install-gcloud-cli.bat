@echo off
REM Google Cloud CLI 설치 안내 스크립트

chcp 65001 >nul
echo ============================================
echo    Google Cloud CLI 설치 안내
echo ============================================
echo.

REM gcloud CLI 확인
where gcloud >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ gcloud CLI가 이미 설치되어 있습니다!
    echo.
    gcloud --version
    echo.
    pause
    exit /b 0
)

echo ❌ gcloud CLI가 설치되지 않았습니다.
echo.

echo 📥 설치 방법:
echo.
echo 방법 1: 공식 설치 프로그램 사용 (추천)
echo.
echo    1. 다음 링크에서 다운로드:
echo       https://cloud.google.com/sdk/docs/install-sdk
echo.
echo    2. Windows용 설치 프로그램 다운로드
echo.
echo    3. 설치 프로그램 실행:
echo       - 기본 설정으로 설치
echo       - PATH 환경 변수에 자동 추가됨
echo.
echo    4. 설치 완료 후:
echo       ⚠️  새로운 CMD 또는 PowerShell 창을 열어야 합니다!
echo       (현재 창에서는 gcloud 명령어가 인식되지 않을 수 있음)
echo.
echo 방법 2: Chocolatey 사용 (패키지 관리자)
echo.
echo    choco install gcloudsdk
echo.
echo 방법 3: 수동 설치
echo.
echo    1. https://cloud.google.com/sdk/docs/install-sdk 접속
echo    2. "Cloud SDK 설치" 섹션에서 수동 설치 방법 참고
echo.
echo ============================================
echo.

set /p OPEN_BROWSER="브라우저에서 다운로드 페이지를 열까요? (Y/N): "
if /i "%OPEN_BROWSER%"=="Y" (
    start https://cloud.google.com/sdk/docs/install-sdk
)

echo.
echo 설치 후:
echo   1. 새로운 CMD 또는 PowerShell 창 열기
echo   2. gcloud-login.bat 실행
echo   3. 또는: gcloud auth login 실행
echo.

pause



