@echo off
REM Google Cloud Compute Engine VM 초기 설정 스크립트

chcp 65001 >nul
echo ============================================
echo    Compute Engine VM 초기 설정
echo ============================================
echo.
echo 이 스크립트는 Compute Engine VM에 Java와 필요한 패키지를 설치합니다.
echo.

set /p INSTANCE_NAME="인스턴스 이름 (기본: chopplan-server): "
if "%INSTANCE_NAME%"=="" set INSTANCE_NAME=chopplan-server

set /p ZONE="리전-존 (예: us-west1-a): "
if "%ZONE%"=="" (
    echo ❌ 존을 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo ⚙️  VM 설정 시작...
echo.

REM 시스템 업데이트 및 Java 설치
echo [1/3] 시스템 업데이트 및 Java 17 설치 중...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="sudo apt update && sudo apt upgrade -y && sudo apt install openjdk-17-jdk -y"

if %errorlevel% neq 0 (
    echo ❌ Java 설치 실패
    pause
    exit /b 1
)

echo ✅ Java 설치 완료
echo.

REM 디렉토리 생성
echo [2/3] 애플리케이션 디렉토리 생성 중...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="mkdir -p ~/chopplan/static"

if %errorlevel% neq 0 (
    echo ❌ 디렉토리 생성 실패
    pause
    exit /b 1
)

echo ✅ 디렉토리 생성 완료
echo.

REM 방화벽 규칙 안내
echo [3/3] 방화벽 규칙 확인...
echo.
echo ⚠️  방화벽 규칙 설정 필요:
echo    포트 8080을 열어야 합니다.
echo.
echo 다음 명령어로 방화벽 규칙 생성:
echo    gcloud compute firewall-rules create allow-http-8080 --allow tcp:8080 --source-ranges 0.0.0.0/0 --description "Allow HTTP port 8080"
echo.
echo 또는 Cloud Console에서:
echo    VPC 네트워크 ^> 방화벽 규칙 ^> 방화벽 규칙 만들기
echo    - 포트: TCP 8080
echo    - 소스 IP 범위: 0.0.0.0/0
echo.

echo ✅ VM 초기 설정 완료!
echo.
pause



