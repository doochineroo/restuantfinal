@echo off
REM 프론트엔드만 빠르게 배포 (C:\yonsai\chopplan\choprest 에서 실행)

chcp 65001 >nul
echo 🚀 프론트엔드 빠른 배포...

set INSTANCE_NAME=chopplan-server
set ZONE=us-west1-a

cd frontend
if not exist package.json (
    echo ❌ 프론트엔드 디렉토리를 찾을 수 없습니다.
    echo    경로: C:\yonsai\chopplan\choprest\frontend
    cd ..
    pause
    exit /b 1
)
call npm run build >nul 2>&1
cd ..

gcloud compute scp --recurse frontend\build\* %INSTANCE_NAME%:chopplan/static/ --zone=%ZONE% --quiet --compress

if %errorlevel% equ 0 (
    echo ✅ 프론트엔드 배포 완료!
) else (
    echo ❌ 배포 실패
)

