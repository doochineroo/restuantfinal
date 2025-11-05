@echo off
REM Google Cloud Compute Engine 전체 배포 스크립트

chcp 65001 >nul
echo ============================================
echo    Google Cloud Compute Engine 배포
echo ============================================
echo.

echo ✅ Google Cloud 배포 준비 완료
echo    VM 내부 MySQL 사용 (localhost)
echo.

REM 1. 백엔드 빌드
echo 📦 [1/5] 백엔드 빌드 중...
call gradlew.bat clean build

if %errorlevel% neq 0 (
    echo ❌ 백엔드 빌드 실패
    pause
    exit /b 1
)

echo ✅ 백엔드 빌드 완료
echo.

REM 2. 프론트엔드 빌드
echo 📦 [2/5] 프론트엔드 빌드 중...
cd frontend
if not exist package.json (
    echo ❌ 프론트엔드 디렉토리를 찾을 수 없습니다.
    echo    경로: C:\yonsai\chopplan\choprest\frontend
    cd ..
    pause
    exit /b 1
)
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 빌드 실패
    cd ..
    pause
    exit /b 1
)

cd ..
echo ✅ 프론트엔드 빌드 완료
echo.

REM 3. JAR 파일 업로드
echo 📤 [3/5] JAR 파일을 Compute Engine에 업로드 중...

REM 인스턴스 이름 확인 (사용자 입력 또는 기본값)
set /p INSTANCE_NAME="Compute Engine 인스턴스 이름 (기본: chopplan-server): "
if "%INSTANCE_NAME%"=="" set INSTANCE_NAME=chopplan-server

set /p ZONE="리전-존 (예: us-west1-a, asia-northeast2-a): "
if "%ZONE%"=="" (
    echo ❌ 존을 입력해야 합니다.
    pause
    exit /b 1
)

gcloud compute scp build\libs\choprest-0.0.1-SNAPSHOT.jar %INSTANCE_NAME%:chopplan/ --zone=%ZONE%

if %errorlevel% neq 0 (
    echo ❌ JAR 파일 업로드 실패
    echo    gcloud CLI가 설치되어 있고 로그인되어 있는지 확인하세요.
    pause
    exit /b 1
)

echo ✅ JAR 파일 업로드 완료
echo.

REM 4. 프론트엔드 파일 업로드
echo 📤 [4/5] 프론트엔드 파일 업로드 중...

REM 프론트엔드를 VM에 직접 업로드하거나 Cloud Storage 사용 가능
REM 여기서는 VM에 업로드하는 방식
gcloud compute scp --recurse frontend\build\* %INSTANCE_NAME%:chopplan/static/ --zone=%ZONE%

if %errorlevel% neq 0 (
    echo ⚠️  프론트엔드 업로드 실패 (계속 진행)
)

echo ✅ 프론트엔드 파일 업로드 완료
echo.

REM 5. 애플리케이션 재시작
echo 🔄 [5/5] 애플리케이션 재시작 중...

gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="cd ~/chopplan && pkill -f java 2>nul && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"

if %errorlevel% neq 0 (
    echo ❌ 애플리케이션 재시작 실패
    pause
    exit /b 1
)

echo ✅ 애플리케이션 재시작 완료
echo.

REM 외부 IP 확인
echo 🌐 서버 접속 정보 확인 중...
for /f "tokens=*" %%i in ('gcloud compute instances describe %INSTANCE_NAME% --zone=%ZONE% --format="get(networkInterfaces[0].accessConfigs[0].natIP)"') do set EXTERNAL_IP=%%i

echo.
echo ============================================
echo    ✅ 배포 완료!
echo ============================================
echo.
echo 🌐 서버 주소:
echo    백엔드 API: http://%EXTERNAL_IP%:8080/api
echo    프론트엔드: http://%EXTERNAL_IP%:8080
echo.
echo 📋 다음 확인사항:
echo    1. 방화벽 규칙에서 포트 8080이 열려있는지 확인
echo    2. 로그 확인: gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="tail -f ~/chopplan/app.log"
echo.

pause


