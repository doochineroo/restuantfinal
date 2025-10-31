# 🌐 AWS 도메인 설정 가이드

이 가이드는 AWS에서 커스텀 도메인을 설정하는 방법을 설명합니다.

## 📋 사전 준비

1. **도메인 구매 완료** (예: Route53에서 구매 또는 외부에서 구매)
2. **AWS 계정 접근 권한**
3. **현재 배포 상태 확인**
   - CloudFront Distribution ID: `E285T5MAAKCZRR`
   - S3 Bucket: `chopplandemo-app`
   - EC2 Host: `ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com`

---

## 🔧 1단계: Route53에서 호스팅 영역 생성

### 1.1 Route53 콘솔 접근
1. AWS 콘솔 → **Route 53** 서비스 선택
2. 왼쪽 메뉴에서 **"Hosted zones"** 클릭
3. **"Create hosted zone"** 버튼 클릭

### 1.2 호스팅 영역 설정
```
Domain name: yourdomain.com (또는 www.yourdomain.com)
Type: Public hosted zone
```

### 1.3 생성 완료 확인
- 호스팅 영역이 생성되면 **NS (Name Server)** 레코드 4개가 자동 생성됩니다.
- 이 NS 레코드를 도메인 등록 업체에 설정해야 합니다.

---

## 🔒 2단계: SSL 인증서 발급 (ACM)

### 2.1 ACM 콘솔 접근
1. AWS 콘솔 → **Certificate Manager** 서비스 선택
2. **리전 선택: `us-east-1`** (CloudFront는 us-east-1에서만 인증서 사용 가능)
3. **"Request a certificate"** 클릭

### 2.2 인증서 요청
```
Certificate type: Request a public certificate
Domain names:
  - yourdomain.com
  - www.yourdomain.com
  - api.yourdomain.com (백엔드용)
Validation method: DNS validation
```

### 2.3 DNS 검증
1. 인증서 요청 후 **CNAME 레코드**가 생성됩니다.
2. Route53에서 호스팅 영역 → **"Create record"** 클릭
3. ACM에서 제공한 CNAME 레코드를 Route53에 추가
4. 검증 완료까지 대기 (보통 몇 분~몇 시간)

---

## ☁️ 3단계: CloudFront에 커스텀 도메인 추가

### 3.1 CloudFront Distribution 편집
1. AWS 콘솔 → **CloudFront** 서비스 선택
2. Distribution ID `E285T5MAAKCZRR` 클릭
3. **"General"** 탭 → **"Edit"** 클릭

### 3.2 커스텀 도메인 설정
```
Alternate domain names (CNAMEs):
  - www.yourdomain.com

SSL Certificate:
  - Custom SSL certificate (example.com)
  - ACM에서 발급한 인증서 선택
```

### 3.3 변경사항 배포
- 변경사항 저장 후 **배포 완료**까지 대기 (15-30분)

---

## 🔗 4단계: Route53에서 CloudFront 연결

### 4.1 A 레코드 생성
1. Route53 → 호스팅 영역 → **"Create record"** 클릭
2. 레코드 설정:
```
Record name: www (또는 @)
Record type: A
Alias: Yes
Route traffic to: CloudFront distribution
  - Distribution 선택
Value: CloudFront Distribution 선택
```

### 4.2 루트 도메인 연결 (선택사항)
루트 도메인(`yourdomain.com`)을 사용하려면:
1. Route53에서 **A 레코드** 또는 **Alias 레코드** 생성
2. CloudFront Distribution에 루트 도메인도 추가

---

## 🚀 5단계: 백엔드 API 도메인 설정

### 5.1 API 서브도메인 레코드 생성
1. Route53 → 호스팅 영역 → **"Create record"** 클릭
2. 레코드 설정:
```
Record name: api
Record type: A
Alias: No
Value: EC2 퍼블릭 IP 주소
TTL: 300
```

또는 ALB를 사용하는 경우:
```
Record name: api
Record type: A
Alias: Yes
Route traffic to: Application and Classic Load Balancer
  - 리전 선택
  - Load Balancer 선택
```

### 5.2 EC2 보안 그룹 확인
- 포트 8080이 열려있는지 확인
- 필요시 보안 그룹 규칙 추가

---

## ⚙️ 6단계: 프론트엔드 환경변수 설정

### 6.1 환경변수 파일 생성
`frontend/.env.production` 파일 생성:

```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
PUBLIC_URL=https://www.yourdomain.com
```

**참고:** 
- `.env.production.example` 파일을 참고하세요
- 환경변수는 빌드 시점에 포함되므로 배포 전에 올바른 값으로 설정해야 합니다
- `.env.production` 파일은 `.gitignore`에 추가하여 커밋하지 않도록 하세요

### 6.2 빌드 및 배포
```bash
cd frontend
npm run build:aws
aws s3 sync build/ s3://chopplandemo-app --delete
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
```

---

## 🔄 7단계: 백엔드 도메인 설정 (선택사항)

### 7.1 Spring Boot 설정
`src/main/resources/application.properties`:
```properties
server.port=8080
server.address=0.0.0.0

# CORS 설정
spring.web.cors.allowed-origins=https://www.yourdomain.com,https://yourdomain.com
```

### 7.2 Nginx 리버스 프록시 설정 (선택사항)
EC2에 Nginx 설치 후 설정:

```nginx
# /etc/nginx/sites-available/api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ✅ 8단계: 도메인 설정 확인

### 8.1 DNS 전파 확인
```bash
# DNS 전파 확인
nslookup www.yourdomain.com
nslookup api.yourdomain.com

# 또는 온라인 도구 사용
# https://www.whatsmydns.net/
```

### 8.2 SSL 인증서 확인
```bash
# SSL 연결 테스트
curl -I https://www.yourdomain.com
openssl s_client -connect www.yourdomain.com:443
```

### 8.3 프론트엔드 테스트
1. 브라우저에서 `https://www.yourdomain.com` 접속
2. 개발자 도구 → Network 탭에서 API 요청 확인
3. 모든 요청이 `https://api.yourdomain.com/api`로 전송되는지 확인

---

## 📝 AWS CLI를 이용한 자동화 스크립트

### 도메인 설정 확인 스크립트
`setup-domain.sh` 파일 생성:

```bash
#!/bin/bash

DOMAIN="yourdomain.com"
WWW_DOMAIN="www.$DOMAIN"
API_DOMAIN="api.$DOMAIN"
CLOUDFRONT_ID="E285T5MAAKCZRR"

echo "🌐 도메인 설정 시작..."

# 1. 호스팅 영역 생성
echo "📝 Route53 호스팅 영역 생성 중..."
aws route53 create-hosted-zone \
    --name $DOMAIN \
    --caller-reference $(date +%s)

echo "✅ 호스팅 영역 생성 완료"

# 2. CloudFront에 커스텀 도메인 추가
echo "☁️ CloudFront Distribution 업데이트 중..."
aws cloudfront update-distribution \
    --id $CLOUDFRONT_ID \
    --if-match $(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query 'ETag' --output text) \
    --distribution-config file://cloudfront-config.json

echo "✅ CloudFront 설정 완료"

# 3. Route53 레코드 생성
echo "🔗 Route53 레코드 생성 중..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN --query 'HostedZones[0].Id' --output text | cut -d'/' -f3)

CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query 'Distribution.DomainName' --output text)

# A 레코드 생성
aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch file://route53-record.json

echo "✅ Route53 레코드 생성 완료"

echo "🎉 도메인 설정 완료!"
echo "🌐 Frontend: https://$WWW_DOMAIN"
echo "🌐 Backend API: https://$API_DOMAIN"
```

---

## 🛠️ 문제 해결

### DNS 전파 지연
- DNS 변경사항은 전 세계로 전파되는데 **24-48시간** 걸릴 수 있습니다.
- 보통은 **1-2시간** 내에 전파됩니다.

### SSL 인증서 검증 실패
- CNAME 레코드가 정확히 입력되었는지 확인
- DNS 전파 대기
- ACM에서 인증서 상태 확인

### CloudFront 캐시 문제
```bash
# 캐시 무효화
aws cloudfront create-invalidation \
    --distribution-id E285T5MAAKCZRR \
    --paths "/*"
```

### CORS 오류
백엔드에서 새 도메인을 허용하도록 설정:
```properties
spring.web.cors.allowed-origins=https://www.yourdomain.com
```

---

## 📚 추가 리소스

- [Route53 문서](https://docs.aws.amazon.com/route53/)
- [CloudFront 문서](https://docs.aws.amazon.com/cloudfront/)
- [ACM 문서](https://docs.aws.amazon.com/acm/)
- [AWS CLI 명령어 참조](https://docs.aws.amazon.com/cli/latest/reference/)

---

## ✅ 체크리스트

도메인 설정이 완료되면 다음을 확인하세요:

- [ ] Route53 호스팅 영역 생성
- [ ] NS 레코드를 도메인 등록 업체에 설정
- [ ] SSL 인증서 발급 (ACM)
- [ ] DNS 검증 완료
- [ ] CloudFront에 커스텀 도메인 추가
- [ ] Route53 A 레코드 생성
- [ ] API 서브도메인 레코드 생성
- [ ] 프론트엔드 환경변수 설정
- [ ] 프론트엔드 재빌드 및 배포
- [ ] DNS 전파 완료 (24-48시간)
- [ ] SSL 연결 테스트 성공
- [ ] 프론트엔드-백엔드 통신 확인

---

**마지막 업데이트:** 2024년

