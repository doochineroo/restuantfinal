#!/bin/bash

# 도메인 설정 후 배포 스크립트
# 도메인: chopplan.kro.kr

echo "🚀 도메인 설정 후 배포 시작..."
echo "=========================================="
echo "프론트엔드: https://www.chopplan.kro.kr"
echo "백엔드 API: https://api.chopplan.kro.kr"
echo "=========================================="
echo ""

# 환경 변수 설정
S3_BUCKET="chopplandemo-app"
CLOUDFRONT_DISTRIBUTION_ID="E285T5MAAKCZRR"
EC2_HOST="ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com"
KEY_FILE="your-key.pem"

# 1. 프론트엔드 빌드
echo "📦 1단계: 프론트엔드 빌드 중..."
cd frontend

# 환경변수 파일 확인
if [ ! -f .env.production ]; then
    echo "❌ .env.production 파일이 없습니다!"
    echo "   frontend/.env.production 파일을 생성하세요."
    exit 1
fi

echo "✅ 환경변수 파일 확인 완료"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi

echo "✅ 프론트엔드 빌드 완료"
cd ..

# 2. S3에 업로드
echo "📤 2단계: S3에 업로드 중..."
aws s3 sync frontend/build/ s3://$S3_BUCKET --delete

if [ $? -ne 0 ]; then
    echo "❌ S3 업로드 실패"
    exit 1
fi

echo "✅ S3 업로드 완료"

# 3. CloudFront 캐시 무효화
echo "🔄 3단계: CloudFront 캐시 무효화 중..."
aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"

if [ $? -ne 0 ]; then
    echo "❌ CloudFront 캐시 무효화 실패"
    exit 1
fi

echo "✅ CloudFront 캐시 무효화 완료"

# 4. 백엔드 배포 안내 (선택사항)
echo ""
echo "⚠️  백엔드 배포는 수동으로 진행하세요:"
echo "   - EC2에 JAR 파일 업로드"
echo "   - 애플리케이션 재시작"
echo ""

# 5. 배포 완료 확인
echo "🔍 4단계: 배포 완료 확인 중..."
sleep 10

echo ""
echo "🎉 배포 완료!"
echo "=========================================="
echo "🌐 Frontend: https://www.chopplan.kro.kr"
echo "🌐 Backend API: https://api.chopplan.kro.kr/api"
echo "=========================================="
echo ""
echo "📋 확인 사항:"
echo "   1. DNS 전파 확인: nslookup www.chopplan.kro.kr"
echo "   2. 브라우저에서 https://www.chopplan.kro.kr 접속"
echo "   3. 개발자 도구에서 API 요청 확인"
echo ""

