@echo off
REM 파일만 빠르게 업로드 (C:\yonsai\chopplan\choprest 에서 실행)

chcp 65001 >nul
echo 🚀 빠른 파일 업로드...

set INSTANCE_NAME=chopplan-server
set ZONE=us-west1-a

echo 📤 JAR 파일 업로드 중...
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar %INSTANCE_NAME%:chopplan/ --zone=%ZONE% --quiet --compress

echo 📤 프론트엔드 파일 업로드 중...
gcloud compute scp --recurse frontend\build\* %INSTANCE_NAME%:chopplan/static/ --zone=%ZONE% --quiet --compress

echo ✅ 업로드 완료!

