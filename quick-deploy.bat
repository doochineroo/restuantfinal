@echo off
REM 빠른 배포 스크립트 (C:\yonsai\chopplan\choprest 에서 실행)

chcp 65001 >nul
echo ============================================
echo     🚀 빠른 배포 시작
echo ============================================
echo.

REM 현재 위치 확인
if not exist build.gradle (
    echo ❌ 오류: C:\yonsai\chopplan\choprest 위치에서 실행해야 합니다.
    pause
    exit /b 1
)

set INSTANCE_NAME=chopplan-server
set ZONE=us-west1-a

echo 📦 [1/4] 백엔드 빌드 중...
call gradlew.bat clean build -q
if %errorlevel% neq 0 (
    echo ❌ 백엔드 빌드 실패
    pause
    exit /b 1
)
echo ✅ 백엔드 빌드 완료
echo.

echo 📦 [2/4] 프론트엔드 빌드 중...
cd frontend
if not exist package.json (
    echo ❌ 프론트엔드 디렉토리를 찾을 수 없습니다.
    echo    경로: C:\yonsai\chopplan\choprest\frontend
    cd ..
    pause
    exit /b 1
)
call npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 빌드 실패
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ 프론트엔드 빌드 완료
echo.

echo 📤 [3/4] 파일 업로드 중...
REM JAR 파일 업로드 (압축 옵션 사용)
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar %INSTANCE_NAME%:chopplan/ --zone=%ZONE% --quiet --compress
if %errorlevel% neq 0 (
    echo ❌ JAR 파일 업로드 실패
    pause
    exit /b 1
)

REM 프론트엔드 파일 업로드 (압축 옵션 사용)
gcloud compute scp --recurse frontend\build\* %INSTANCE_NAME%:chopplan/static/ --zone=%ZONE% --quiet --compress
if %errorlevel% neq 0 (
    echo ⚠️  프론트엔드 업로드 실패 (계속 진행)
)
echo ✅ 파일 업로드 완료
echo.

echo 🔄 [4/4] 애플리케이션 재시작 중...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --tunnel-through-iap --command="cd ~/chopplan && pkill -f java 2>/dev/null; sleep 2; nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"

if %errorlevel% neq 0 (
    echo ❌ 애플리케이션 재시작 실패
    echo    수동으로 실행해주세요:
    echo    gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --tunnel-through-iap
    echo    cd ~/chopplan
    echo    nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &
    pause
    exit /b 1
)

echo ✅ 애플리케이션 재시작 완료
timeout /t 3 /nobreak >nul
echo.

echo ============================================
echo     ✅ 배포 완료!
echo ============================================
echo.
REM 외부 IP 동적으로 가져오기
for /f "tokens=*" %%i in ('gcloud compute instances describe %INSTANCE_NAME% --zone=%ZONE% --format="get(networkInterfaces[0].accessConfigs[0].natIP)"') do set EXTERNAL_IP=%%i

echo 🌐 접속 주소:
echo     http://%EXTERNAL_IP%:8080
echo.
echo 📋 로그 확인:
echo     gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="tail -f ~/chopplan/app.log"
echo.