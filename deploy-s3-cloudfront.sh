#!/bin/bash

# AWS EC2 + S3 + CloudFront 배포 스크립트
echo "🚀 AWS EC2 + S3 + CloudFront 배포 시작..."

# 환경 변수 설정 (실제 값으로 변경 필요)
S3_BUCKET="chopplandemo-app"
CLOUDFRONT_DISTRIBUTION_ID="E285T5MAAKCZRR"
EC2_HOST="ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com"
KEY_FILE="your-key.pem"

# 1. 프론트엔드 빌드
echo "📦 프론트엔드 빌드 중..."
cd frontend
npm run build:aws

if [ $? -ne 0 ]; then
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi

echo "✅ 프론트엔드 빌드 완료"

# 2. S3에 업로드
echo "📤 S3에 업로드 중..."
aws s3 sync build/ s3://$S3_BUCKET --delete

if [ $? -ne 0 ]; then
    echo "❌ S3 업로드 실패"
    exit 1
fi

echo "✅ S3 업로드 완료"

# 3. CloudFront 캐시 무효화
echo "🔄 CloudFront 캐시 무효화 중..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

if [ $? -ne 0 ]; then
    echo "❌ CloudFront 캐시 무효화 실패"
    exit 1
fi

echo "✅ CloudFront 캐시 무효화 완료"

# 4. EC2에 백엔드 배포
echo "📦 백엔드 배포 중..."
cd ..
./gradlew clean build

if [ $? -ne 0 ]; then
    echo "❌ 백엔드 빌드 실패"
    exit 1
fi

scp -i $KEY_FILE build/libs/choprest-0.0.1-SNAPSHOT.jar ec2-user@$EC2_HOST:/home/ec2-user/

if [ $? -ne 0 ]; then
    echo "❌ JAR 파일 업로드 실패"
    exit 1
fi

ssh -i $KEY_FILE ec2-user@$EC2_HOST '
    pkill -f choprest
    sleep 2
    nohup java -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
    sleep 5
    ps aux | grep java
'

if [ $? -ne 0 ]; then
    echo "❌ 백엔드 재시작 실패"
    exit 1
fi

echo "✅ 백엔드 배포 완료"

# 5. 배포 완료 확인
echo "🔍 배포 완료 확인 중..."
sleep 10

# API 테스트
echo "🧪 API 테스트..."
curl -s "http://$EC2_HOST:8080/api/restaurants?keyword=명동" | head -c 100
echo ""

# S3 테스트
echo "🧪 S3 테스트..."
curl -s "https://$S3_BUCKET.s3.ap-northeast-2.amazonaws.com/index.html" | head -c 100
echo ""

echo "🎉 배포 완료!"
echo "🌐 Frontend (CloudFront): https://dpt8rhufx9b4x.cloudfront.net"
echo "🌐 Frontend (S3): https://$S3_BUCKET.s3.ap-northeast-2.amazonaws.com"
echo "🌐 Backend API: http://$EC2_HOST:8080/api"
