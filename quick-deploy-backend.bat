@echo off
REM 백엔드만 빠르게 배포 (C:\yonsai\chopplan\choprest 에서 실행)

chcp 65001 >nul
echo 🚀 백엔드 빠른 배포...

set INSTANCE_NAME=chopplan-server
set ZONE=us-west1-a

call gradlew.bat clean build -q && ^
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar %INSTANCE_NAME%:chopplan/ --zone=%ZONE% --quiet --compress && ^
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --command="cd ~/chopplan && pkill -f java 2>/dev/null; sleep 1; nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &" --quiet

if %errorlevel% equ 0 (
    echo ✅ 백엔드 배포 완료!
) else (
    echo ❌ 배포 실패
)

