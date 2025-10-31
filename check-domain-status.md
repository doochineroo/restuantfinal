# 도메인 접속 문제 진단 가이드

## 🔍 1단계: 현재 상태 확인

### DNS 전파 확인
```bash
nslookup www.chopplan.kro.kr
nslookup api.chopplan.kro.kr
```

### 배포 상태 확인
```bash
# S3 버킷 확인
aws s3 ls s3://chopplandemo-app/

# CloudFront 상태 확인
aws cloudfront get-distribution --id E285T5MAAKCZRR --query 'Distribution.Status'
```

---

## 🐛 주요 원인별 해결 방법

### 1. DNS 전파 문제
- **증상**: DNS 조회가 안되거나 잘못된 IP 반환
- **해결**: 
  - Route53 콘솔에서 레코드 확인
  - DNS 전파 확인 사이트: https://www.whatsmydns.net/
  - 24-48시간 대기 (보통 1-2시간)

### 2. CloudFront 배포 미완료
- **증상**: CloudFront Distribution이 "InProgress" 상태
- **해결**: CloudFront 콘솔에서 배포 완료 대기 (15-30분)

### 3. 커스텀 도메인 미설정
- **증상**: CloudFront에 커스텀 도메인이 추가되지 않음
- **해결**: 
  1. CloudFront 콘솔 → Distribution E285T5MAAKCZRR
  2. General 탭 → Edit
  3. Alternate domain names (CNAMEs)에 `www.chopplan.kro.kr` 추가
  4. Custom SSL certificate 선택
  5. 저장 후 배포 완료 대기

### 4. SSL 인증서 문제
- **증상**: SSL 연결 오류
- **해결**:
  1. ACM 콘솔에서 인증서 상태 확인 (us-east-1 리전)
  2. DNS 검증 완료 확인
  3. CloudFront에 올바른 인증서 연결 확인

### 5. Route53 레코드 문제
- **증상**: 레코드가 생성되지 않음
- **해결**:
  1. Route53 콘솔 → 호스팅 영역 → chopplan.kro.kr
  2. 레코드 확인:
     - www (A 레코드) → CloudFront Distribution
     - api (A 레코드) → EC2 IP (52.78.137.215)

---

## ✅ 빠른 체크리스트

1. [ ] Route53 호스팅 영역 생성됨
2. [ ] NS 레코드를 도메인 등록 업체에 설정함
3. [ ] ACM 인증서 발급 및 검증 완료 (us-east-1)
4. [ ] CloudFront에 커스텀 도메인 추가됨
5. [ ] CloudFront Distribution 배포 완료됨
6. [ ] Route53 A 레코드 생성됨
7. [ ] DNS 전파 완료됨
8. [ ] 프론트엔드 빌드 및 배포 완료됨

---

## 🛠️ 문제 해결 명령어

### DNS 확인
```bash
# Windows
nslookup www.chopplan.kro.kr
nslookup api.chopplan.kro.kr

# curl로 HTTP 확인
curl -I http://www.chopplan.kro.kr
curl -I https://www.chopplan.kro.kr
```

### CloudFront 상태 확인
```bash
aws cloudfront get-distribution --id E285T5MAAKCZRR --query 'Distribution.{Status:Status,DomainName:DomainName,Aliases:Aliases.Items}'
```

### S3 배포 확인
```bash
aws s3 ls s3://chopplandemo-app/ --recursive | findstr index.html
```

