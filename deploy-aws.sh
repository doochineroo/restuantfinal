#!/bin/bash

# AWS EC2 배포 스크립트
echo "🚀 AWS EC2 배포 시작..."

# 1. 백엔드 빌드
echo "📦 백엔드 JAR 파일 빌드 중..."
./gradlew clean build

if [ $? -ne 0 ]; then
    echo "❌ 백엔드 빌드 실패"
    exit 1
fi

echo "✅ 백엔드 빌드 완료"

# 2. 프론트엔드 빌드
echo "📦 프론트엔드 빌드 중..."
cd frontend
npm run build:aws

if [ $? -ne 0 ]; then
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi

echo "✅ 프론트엔드 빌드 완료"
cd ..

# 3. JAR 파일을 EC2로 업로드
echo "📤 JAR 파일을 EC2로 업로드 중..."
scp -i your-key.pem build/libs/choprest-0.0.1-SNAPSHOT.jar ec2-user@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:/home/ec2-user/

if [ $? -ne 0 ]; then
    echo "❌ JAR 파일 업로드 실패"
    exit 1
fi

echo "✅ JAR 파일 업로드 완료"

# 4. 프론트엔드 파일을 EC2로 업로드
echo "📤 프론트엔드 파일을 EC2로 업로드 중..."
scp -i your-key.pem -r frontend/build/* ec2-user@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:/var/www/html/

if [ $? -ne 0 ]; then
    echo "❌ 프론트엔드 파일 업로드 실패"
    exit 1
fi

echo "✅ 프론트엔드 파일 업로드 완료"

# 5. EC2에서 애플리케이션 재시작
echo "🔄 EC2에서 애플리케이션 재시작 중..."
ssh -i your-key.pem ec2-user@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com '
    pkill -f choprest
    sleep 2
    nohup java -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
    sleep 5
    ps aux | grep java
'

if [ $? -ne 0 ]; then
    echo "❌ 애플리케이션 재시작 실패"
    exit 1
fi

echo "✅ 애플리케이션 재시작 완료"

# 6. 배포 완료 확인
echo "🔍 배포 완료 확인 중..."
sleep 10

# API 테스트
echo "🧪 API 테스트..."
curl -s "http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:8080/api/restaurants?keyword=명동" | head -c 100
echo ""

# 프론트엔드 테스트
echo "🧪 프론트엔드 테스트..."
curl -s "http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com" | head -c 100
echo ""

echo "🎉 배포 완료!"
echo "🌐 Backend API: http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:8080/api"
echo "🌐 Frontend: http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com"
