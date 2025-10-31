# 🚨 도메인 접속 안됨 - 빠른 해결 가이드

## 현재 상황
DNS 조회 결과: `Non-existent domain` - DNS 레코드가 설정되지 않았거나 전파되지 않았습니다.

---

## ✅ 해결 방법

### 1️⃣ Route53 레코드 확인 및 생성

#### AWS 콘솔에서 확인:
1. **Route53 콘솔** 접속
2. **Hosted zones** → `chopplan.kro.kr` 선택
3. 레코드 확인:
   - `www` (A 레코드) - CloudFront Distribution으로 설정되어 있어야 함
   - `api` (A 레코드) - EC2 IP (52.78.137.215)로 설정되어 있어야 함

#### 레코드가 없다면 생성:
1. **Create record** 클릭
2. **www 레코드 생성:**
   ```
   Record name: www
   Record type: A
   Alias: Yes
   Route traffic to: CloudFront distribution
   Distribution: E285T5MAAKCZRR 선택
   ```
3. **api 레코드 생성:**
   ```
   Record name: api
   Record type: A
   Alias: No
   Value: 52.78.137.215
   TTL: 300
   ```

---

### 2️⃣ NS 레코드 확인 (중요!)

**도메인 등록 업체(kro.kr 등록사이트)에서:**
1. 도메인 관리 페이지 접속
2. DNS 설정 / 네임서버 설정 메뉴 찾기
3. Route53에서 제공하는 NS 레코드 4개를 설정:
   - Route53 호스팅 영역 → NS 레코드 확인
   - 예: `ns-xxx.awsdns-xx.com` 형태의 4개 값
4. 저장 후 1-2시간 대기

**⚠️ 이 설정이 없으면 DNS가 전파되지 않습니다!**

---

### 3️⃣ CloudFront 커스텀 도메인 설정 확인

1. **CloudFront 콘솔** 접속
2. Distribution **E285T5MAAKCZRR** 선택
3. **General** 탭 → **Edit** 클릭
4. 확인:
   - **Alternate domain names (CNAMEs)**: `www.chopplan.kro.kr` 추가되어 있는지
   - **Custom SSL certificate**: ACM 인증서 선택되어 있는지 (us-east-1 리전)
5. 저장 후 배포 완료 대기 (15-30분)

---

### 4️⃣ 프론트엔드 배포 확인

배포가 안 되어 있을 수 있습니다:

```bash
# S3 확인
aws s3 ls s3://chopplandemo-app/index.html

# 배포 안 되어 있다면 배포
cd frontend
npm run build
aws s3 sync build/ s3://chopplandemo-app --delete
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
```

---

## 🔍 단계별 확인 체크리스트

각 단계를 확인하세요:

### ✅ Route53 설정
- [ ] 호스팅 영역 생성됨 (`chopplan.kro.kr`)
- [ ] www A 레코드 생성됨 (CloudFront로)
- [ ] api A 레코드 생성됨 (52.78.137.215로)
- [ ] NS 레코드 4개 확인됨

### ✅ 도메인 등록 업체 설정
- [ ] 도메인 등록 업체 사이트에서 NS 레코드 설정 완료
- [ ] 설정 후 1-2시간 경과 (DNS 전파 대기)

### ✅ ACM 인증서
- [ ] us-east-1 리전에서 인증서 발급됨
- [ ] DNS 검증 완료됨 (상태: Issued)

### ✅ CloudFront 설정
- [ ] 커스텀 도메인 추가됨 (`www.chopplan.kro.kr`)
- [ ] SSL 인증서 연결됨
- [ ] 배포 완료됨 (상태: Deployed)

### ✅ 프론트엔드 배포
- [ ] 빌드 완료됨
- [ ] S3에 업로드됨
- [ ] CloudFront 캐시 무효화 완료됨

---

## 🧪 테스트 명령어

### DNS 전파 확인
```bash
nslookup www.chopplan.kro.kr
nslookup api.chopplan.kro.kr
```

### 온라인 도구로 확인
- https://www.whatsmydns.net/
- 도메인: `www.chopplan.kro.kr` 입력

### HTTP 접속 테스트
```bash
# CloudFront 직접 접속 (도메인 설정 전에도 작동해야 함)
curl -I https://dpt8rhufx9b4x.cloudfront.net

# 커스텀 도메인 (DNS 전파 후)
curl -I https://www.chopplan.kro.kr
```

---

## ⏰ 예상 소요 시간

1. **Route53 레코드 생성**: 즉시
2. **NS 레코드 설정**: 도메인 등록 업체에서 설정 (5분)
3. **DNS 전파**: 1-48시간 (보통 1-2시간)
4. **CloudFront 배포**: 15-30분
5. **SSL 인증서 검증**: 몇 분~몇 시간

**총 예상 시간: 2-3시간**

---

## 🆘 여전히 안 되면 확인할 것

1. **도메인 등록 업체 확인**
   - kro.kr 도메인 등록 사이트에서 NS 레코드가 올바르게 설정되었는지

2. **Route53 호스팅 영역 확인**
   - 올바른 도메인명인지 (`chopplan.kro.kr`)

3. **CloudFront Origin 확인**
   - S3 버킷이 올바르게 연결되어 있는지

4. **보안 그룹 확인** (API용)
   - EC2 보안 그룹에서 포트 8080이 열려있는지

---

## 💡 임시 해결책

도메인 전파가 완료될 때까지 CloudFront URL 사용:

```
Frontend: https://dpt8rhufx9b4x.cloudfront.net
Backend: http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:8080/api
```

이 URL들은 도메인 설정과 무관하게 작동합니다.

