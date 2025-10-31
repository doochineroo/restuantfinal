# 🔧 도메인 접속 문제 해결

## 🔍 현재 상황 확인

접속을 시도했을 때 발생할 수 있는 문제들을 확인합니다.

---

## ✅ 1단계: DNS 전파 확인

### 확인 방법:
```bash
nslookup www.chopplan.kro.kr
```

### 예상 결과:
```
www.chopplan.kro.kr
  -> dpt8rhufx9b4x.cloudfront.net
  -> CloudFront IP 주소들
```

### 문제가 있다면:
- DNS 전파가 아직 완료되지 않았을 수 있음 (1-2시간 더 대기)
- NS 레코드가 올바르게 설정되지 않았을 수 있음

---

## ✅ 2단계: CloudFront 커스텀 도메인 확인

### 확인해야 할 것:
1. **Alternate domain names (CNAMEs)**
   - `www.chopplan.kro.kr` 추가되어 있어야 함

2. **Custom SSL certificate**
   - ACM 인증서 선택되어 있어야 함
   - 리전: **us-east-1**에서 발급된 인증서

3. **Distribution Status**
   - **Deployed** 상태여야 함
   - **InProgress** 상태면 배포 완료 대기

---

## ❌ 주요 에러별 해결 방법

### 에러 1: "This site can't be reached"
**원인:** DNS 전파 미완료 또는 DNS 레코드 문제

**해결:**
1. DNS 전파 확인 (온라인 도구 사용)
2. Route53 레코드 확인
3. NS 레코드 설정 확인

---

### 에러 2: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"
**원인:** SSL 인증서 문제

**해결:**
1. CloudFront에서 Custom SSL certificate 확인
2. ACM 인증서 상태 확인 (us-east-1 리전)
3. 인증서 검증 완료 여부 확인

---

### 에러 3: "403 Forbidden" 또는 "Access Denied"
**원인:** CloudFront Origin 또는 S3 설정 문제

**해결:**
1. S3 버킷 접근 권한 확인
2. CloudFront Origin 설정 확인
3. Default root object: `index.html` 확인

---

### 에러 4: "404 Not Found"
**원인:** 프론트엔드 배포 문제

**해결:**
```bash
# S3에 파일이 있는지 확인
aws s3 ls s3://chopplandemo-app/index.html

# 없다면 배포
cd frontend
npm run build
aws s3 sync build/ s3://chopplandemo-app --delete
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
```

---

### 에러 5: "This page isn't working" 또는 "ERR_CONNECTION_REFUSED"
**원인:** CloudFront 배포 미완료

**해결:**
1. CloudFront 콘솔에서 Distribution 상태 확인
2. **Deployed** 상태가 될 때까지 대기 (15-30분)
3. CloudFront 캐시 무효화:
   ```bash
   aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
   ```

---

## 🔍 빠른 진단 명령어

### HTTP 상태 확인:
```bash
curl -I https://www.chopplan.kro.kr
```

### SSL 인증서 확인:
```bash
openssl s_client -connect www.chopplan.kro.kr:443 -servername www.chopplan.kro.kr
```

### CloudFront 직접 접속 테스트:
```bash
curl -I https://dpt8rhufx9b4x.cloudfront.net
```
(이것이 작동하면 CloudFront 설정은 정상)

---

## 📋 체크리스트

- [ ] DNS 전파 완료됨 (nslookup으로 확인)
- [ ] CloudFront 커스텀 도메인 설정됨
- [ ] SSL 인증서 연결됨 (ACM us-east-1)
- [ ] CloudFront Distribution 배포 완료됨 (Deployed 상태)
- [ ] S3에 프론트엔드 파일 배포됨
- [ ] CloudFront 캐시 무효화 완료됨

---

## 💡 다음 단계

1. **에러 메시지 확인**
   - 브라우저에서 보이는 정확한 에러 메시지 확인

2. **개발자 도구 확인**
   - F12 → Console 탭에서 에러 확인
   - Network 탭에서 실패한 요청 확인

3. **CloudFront 설정 확인**
   - 커스텀 도메인 추가 여부
   - SSL 인증서 연결 여부

4. **S3 배포 확인**
   - 프론트엔드 파일이 업로드되었는지

---

어떤 에러 메시지가 보이나요? 정확한 에러 메시지를 알려주시면 더 구체적으로 도와드릴 수 있습니다!

