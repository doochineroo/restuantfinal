@echo off
REM 도메인 설정 후 배포 스크립트 (Windows)
REM 도메인: chopplan.kro.kr

echo 🚀 도메인 설정 후 배포 시작...
echo ==========================================
echo 프론트엔드: https://www.chopplan.kro.kr
echo 백엔드 API: https://api.chopplan.kro.kr
echo ==========================================
echo.

REM 환경 변수 설정
set S3_BUCKET=chopplandemo-app
set CLOUDFRONT_DISTRIBUTION_ID=E285T5MAAKCZRR
set EC2_HOST=ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com
set KEY_FILE=your-key.pem

REM 1. 프론트엔드 빌드
echo 📦 1단계: 프론트엔드 빌드 중...
cd frontend

REM 환경변수 파일 확인
if not exist .env.production (
    echo ❌ .env.production 파일이 없습니다!
    echo    frontend/.env.production 파일을 생성하세요.
    exit /b 1
)

echo ✅ 환경변수 파일 확인 완료
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 빌드 실패
    exit /b 1
)

echo ✅ 프론트엔드 빌드 완료
cd ..

REM 2. S3에 업로드
echo 📤 2단계: S3에 업로드 중...
aws s3 sync frontend\build\ s3://%S3_BUCKET% --delete

if %errorlevel% neq 0 (
    echo ❌ S3 업로드 실패
    exit /b 1
)

echo ✅ S3 업로드 완료

REM 3. CloudFront 캐시 무효화
echo 🔄 3단계: CloudFront 캐시 무효화 중...
aws cloudfront create-invalidation --distribution-id %CLOUDFRONT_DISTRIBUTION_ID% --paths "/*"

if %errorlevel% neq 0 (
    echo ❌ CloudFront 캐시 무효화 실패
    exit /b 1
)

echo ✅ CloudFront 캐시 무효화 완료

REM 4. 백엔드 배포 (선택사항)
echo.
echo ⚠️  백엔드 배포는 수동으로 진행하세요:
echo    - EC2에 JAR 파일 업로드
echo    - 애플리케이션 재시작
echo.

REM 5. 배포 완료 확인
echo 🔍 4단계: 배포 완료 확인 중...
timeout /t 10 /nobreak > nul

echo.
echo 🎉 배포 완료!
echo ==========================================
echo 🌐 Frontend: https://www.chopplan.kro.kr
echo 🌐 Backend API: https://api.chopplan.kro.kr/api
echo ==========================================
echo.
echo 📋 확인 사항:
echo    1. DNS 전파 확인 (nslookup www.chopplan.kro.kr)
echo    2. 브라우저에서 https://www.chopplan.kro.kr 접속
echo    3. 개발자 도구에서 API 요청 확인
echo.

pause

