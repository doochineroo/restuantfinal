@echo off
REM 프론트엔드 빌드 및 업로드 스크립트

chcp 65001 >nul
echo ============================================
echo    프론트엔드 빌드 및 업로드
echo ============================================
echo.

REM 현재 위치 확인
cd C:\yonsai\chopplan\choprest

REM 1. 프론트엔드 빌드
echo [1/3] 프론트엔드 빌드 중...
cd frontend

if not exist package.json (
    echo ❌ 프론트엔드 디렉토리를 찾을 수 없습니다.
    echo    경로: C:\yonsai\chopplan\choprest\frontend
    cd ..
    pause
    exit /b 1
)

echo 📦 npm install 실행 중...
call npm install

if %errorlevel% neq 0 (
    echo ❌ npm install 실패
    cd ..
    pause
    exit /b 1
)

echo 📦 빌드 실행 중...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 빌드 실패
    cd ..
    pause
    exit /b 1
)

echo ✅ 프론트엔드 빌드 완료
echo.

REM 2. 빌드 파일 확인
cd ..
echo [2/3] 빌드 파일 확인...
if not exist frontend\build (
    echo ❌ 빌드 디렉토리가 없습니다.
    pause
    exit /b 1
)

echo ✅ 빌드 파일 확인 완료
echo.

REM 3. VM에 업로드
echo [3/3] VM에 업로드 중...
set INSTANCE_NAME=chopplan-server
set ZONE=us-west1-a

echo 📤 프론트엔드 파일 업로드 중...
gcloud compute scp --recurse frontend\build\* %INSTANCE_NAME%:chopplan/static/ --zone=%ZONE% --quiet --compress

if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 업로드 실패
    pause
    exit /b 1
)

echo ✅ 업로드 완료!
echo.
echo ============================================
echo    다음 단계
echo ============================================
echo.
echo 1. 애플리케이션 재시작 (필요시):
echo    gcloud compute ssh chopplan-server --zone=us-west1-a --tunnel-through-iap --command="cd ~/chopplan && pkill -f java; nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"
echo.
echo 2. 브라우저에서 확인:
echo    http://136.117.53.209:8080
echo.
pause

