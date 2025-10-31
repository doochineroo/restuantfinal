#!/bin/bash

# AWS 도메인 설정 스크립트
# 사용 전에 실제 값으로 변경하세요!

# ==================== 설정 ====================
DOMAIN="yourdomain.com"                    # 실제 도메인으로 변경
WWW_DOMAIN="www.$DOMAIN"                    # www 서브도메인
API_DOMAIN="api.$DOMAIN"                    # API 서브도메인
CLOUDFRONT_ID="E285T5MAAKCZRR"              # CloudFront Distribution ID
S3_BUCKET="chopplandemo-app"                # S3 Bucket 이름
EC2_PUBLIC_IP="52.78.137.215"               # EC2 퍼블릭 IP (포트 8080 사용)
REGION="ap-northeast-2"                    # AWS 리전
# ==============================================

echo "🌐 AWS 도메인 설정 스크립트 시작..."
echo "=========================================="
echo "도메인: $DOMAIN"
echo "프론트엔드: $WWW_DOMAIN"
echo "백엔드 API: $API_DOMAIN"
echo "=========================================="
echo ""

# 1. Route53 호스팅 영역 확인
echo "📝 1단계: Route53 호스팅 영역 확인..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
    --dns-name $DOMAIN \
    --query 'HostedZones[0].Id' \
    --output text 2>/dev/null | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo "❌ 호스팅 영역을 찾을 수 없습니다."
    echo "   Route53 콘솔에서 호스팅 영역을 먼저 생성하세요."
    exit 1
fi

echo "✅ 호스팅 영역 ID: $HOSTED_ZONE_ID"
echo ""

# 2. ACM 인증서 확인 (us-east-1 리전)
echo "🔒 2단계: ACM 인증서 확인 (us-east-1 리전)..."
CERT_ARN=$(aws acm list-certificates \
    --region us-east-1 \
    --query "CertificateSummaryList[?DomainName=='$DOMAIN' || DomainName=='*.$DOMAIN'].CertificateArn" \
    --output text | head -n1)

if [ -z "$CERT_ARN" ]; then
    echo "⚠️  인증서를 찾을 수 없습니다."
    echo "   ACM 콘솔에서 인증서를 먼저 발급하세요."
    echo "   리전: us-east-1"
else
    echo "✅ 인증서 ARN: $CERT_ARN"
fi
echo ""

# 3. CloudFront Distribution 업데이트
echo "☁️ 3단계: CloudFront Distribution 확인..."
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id $CLOUDFRONT_ID \
    --query 'Distribution.DomainName' \
    --output text)

if [ -z "$CLOUDFRONT_DOMAIN" ]; then
    echo "❌ CloudFront Distribution을 찾을 수 없습니다."
    exit 1
fi

echo "✅ CloudFront Domain: $CLOUDFRONT_DOMAIN"
echo ""
echo "⚠️  CloudFront에 커스텀 도메인 추가는 AWS 콘솔에서 수동으로 해야 합니다:"
echo "   1. CloudFront → Distribution $CLOUDFRONT_ID"
echo "   2. General 탭 → Edit"
echo "   3. Alternate domain names (CNAMEs)에 $WWW_DOMAIN 추가"
echo "   4. Custom SSL certificate에 ACM 인증서 선택"
echo ""

# 4. Route53 레코드 생성
echo "🔗 4단계: Route53 레코드 생성..."

# CloudFront A 레코드 생성
echo "   - www 서브도메인 레코드 생성 중..."
aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch '{
        "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "'$WWW_DOMAIN'",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "Z2FDTNDATAQYW2",
                    "DNSName": "'$CLOUDFRONT_DOMAIN'",
                    "EvaluateTargetHealth": false
                }
            }
        }]
    }' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ www 서브도메인 레코드 생성 완료"
else
    echo "   ❌ www 서브도메인 레코드 생성 실패"
fi

# API 서브도메인 레코드 생성 (EC2 IP)
echo "   - api 서브도메인 레코드 생성 중..."
aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch '{
        "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "'$API_DOMAIN'",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [{"Value": "'$EC2_PUBLIC_IP'"}]
            }
        }]
    }' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ api 서브도메인 레코드 생성 완료"
else
    echo "   ❌ api 서브도메인 레코드 생성 실패"
fi
echo ""

# 5. 프론트엔드 환경변수 파일 생성
echo "⚙️ 5단계: 프론트엔드 환경변수 파일 생성..."
ENV_FILE="frontend/.env.production"

cat > $ENV_FILE << EOF
# 프로덕션 환경 변수
REACT_APP_API_BASE_URL=https://$API_DOMAIN/api
PUBLIC_URL=https://$WWW_DOMAIN
EOF

echo "✅ 환경변수 파일 생성: $ENV_FILE"
echo "   내용:"
cat $ENV_FILE | sed 's/^/   /'
echo ""

# 6. 배포 스크립트 업데이트
echo "📝 6단계: 배포 스크립트 업데이트 안내..."
echo "   배포 스크립트(deploy-s3-cloudfront.sh)에서 다음을 확인하세요:"
echo "   - S3_BUCKET=$S3_BUCKET"
echo "   - CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_ID"
echo "   - EC2_HOST 설정 확인"
echo ""

# 7. 배포 명령어 출력
echo "🚀 7단계: 배포 명령어"
echo "=========================================="
echo "# 프론트엔드 빌드 및 배포:"
echo "cd frontend"
echo "npm run build:aws"
echo "aws s3 sync build/ s3://$S3_BUCKET --delete"
echo "aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths \"/*\""
echo ""
echo "# 백엔드 배포:"
echo "cd .."
echo "./gradlew clean build"
echo "scp -i your-key.pem build/libs/choprest-0.0.1-SNAPSHOT.jar \\"
echo "    ubuntu@ec2-$EC2_PUBLIC_IP.$REGION.compute.amazonaws.com:~/"
echo ""
echo "# EC2에서 애플리케이션 재시작:"
echo "ssh -i your-key.pem ubuntu@ec2-$EC2_PUBLIC_IP.$REGION.compute.amazonaws.com"
echo "pkill -f choprest"
echo "nohup java -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &"
echo "=========================================="
echo ""

# 8. DNS 전파 안내
echo "⏳ 8단계: DNS 전파 안내"
echo "=========================================="
echo "DNS 레코드 변경사항이 전 세계로 전파되는데 24-48시간이 걸릴 수 있습니다."
echo "보통은 1-2시간 내에 전파됩니다."
echo ""
echo "DNS 전파 확인 방법:"
echo "  nslookup $WWW_DOMAIN"
echo "  nslookup $API_DOMAIN"
echo ""
echo "온라인 도구: https://www.whatsmydns.net/"
echo "=========================================="
echo ""

echo "✅ 도메인 설정 스크립트 완료!"
echo ""
echo "📋 다음 단계:"
echo "   1. CloudFront 콘솔에서 커스텀 도메인 추가 (수동)"
echo "   2. 프론트엔드 빌드 및 배포"
echo "   3. DNS 전파 대기"
echo "   4. https://$WWW_DOMAIN 접속 테스트"
echo ""
echo "📖 자세한 내용은 AWS_DOMAIN_SETUP_GUIDE.md를 참조하세요."

