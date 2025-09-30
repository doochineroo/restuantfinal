@echo off
REM AWS EC2 + S3 + CloudFront 배포 스크립트 (Windows)

echo 🚀 AWS EC2 + S3 + CloudFront 배포 시작...

REM 환경 변수 설정 (실제 값으로 변경 필요)
set S3_BUCKET=chopplandemo-app
set CLOUDFRONT_DISTRIBUTION_ID=E285T5MAAKCZRR
set EC2_HOST=ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com
set KEY_FILE=your-key.pem

REM 1. 프론트엔드 빌드
echo 📦 프론트엔드 빌드 중...
cd frontend
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 빌드 실패
    exit /b 1
)

echo ✅ 프론트엔드 빌드 완료

REM 2. S3에 업로드
echo 📤 S3에 업로드 중...
aws s3 sync build/ s3://%S3_BUCKET% --delete

if %errorlevel% neq 0 (
    echo ❌ S3 업로드 실패
    exit /b 1
)

echo ✅ S3 업로드 완료

REM 3. CloudFront 캐시 무효화
echo 🔄 CloudFront 캐시 무효화 중...
aws cloudfront create-invalidation --distribution-id %CLOUDFRONT_DISTRIBUTION_ID% --paths "/*"

if %errorlevel% neq 0 (
    echo ❌ CloudFront 캐시 무효화 실패
    exit /b 1
)

echo ✅ CloudFront 캐시 무효화 완료

REM 4. EC2에 백엔드 배포
echo 📦 백엔드 배포 중...
cd ..
call gradlew.bat clean build

if %errorlevel% neq 0 (
    echo ❌ 백엔드 빌드 실패
    exit /b 1
)

scp -i %KEY_FILE% build\libs\choprest-0.0.1-SNAPSHOT.jar ec2-user@%EC2_HOST%:/home/ec2-user/

if %errorlevel% neq 0 (
    echo ❌ JAR 파일 업로드 실패
    exit /b 1
)

ssh -i %KEY_FILE% ec2-user@%EC2_HOST% "pkill -f choprest && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 & && sleep 5 && ps aux | grep java"

if %errorlevel% neq 0 (
    echo ❌ 백엔드 재시작 실패
    exit /b 1
)

echo ✅ 백엔드 배포 완료

REM 5. 배포 완료 확인
echo 🔍 배포 완료 확인 중...
timeout /t 10 /nobreak > nul

REM API 테스트
echo 🧪 API 테스트...
curl -s "http://%EC2_HOST%:8080/api/restaurants?keyword=명동"

REM S3 테스트
echo 🧪 S3 테스트...
curl -s "https://%S3_BUCKET%.s3.ap-northeast-2.amazonaws.com/index.html"

echo.
echo 🎉 배포 완료!
echo 🌐 Frontend (CloudFront): https://dpt8rhufx9b4x.cloudfront.net
echo 🌐 Frontend (S3): https://%S3_BUCKET%.s3.ap-northeast-2.amazonaws.com
echo 🌐 Backend API: http://%EC2_HOST%:8080/api

pause
