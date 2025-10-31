# 🔧 DNS 조회 실패 문제 해결 (ERR_NAME_NOT_RESOLVED)

## ❌ 현재 문제

`ERR_NAME_NOT_RESOLVED` 오류 발생:
- DNS 조회가 실패하여 도메인을 IP 주소로 변환할 수 없음
- 브라우저가 `www.chopplan.kro.kr`을 찾을 수 없음

---

## 🔍 원인 분석

### 가능한 원인:

1. **NS 레코드 전파 미완료** (가장 가능성 높음)
   - 도메인 등록 업체에서 NS 레코드가 Route53으로 변경되지 않음
   - 또는 변경되었지만 아직 전파되지 않음

2. **NS 레코드 설정 오류**
   - 내도메인.한국 사이트에서 NS 레코드가 올바르게 설정되지 않음

3. **DNS 캐시 문제**
   - 로컬 DNS 캐시 또는 ISP DNS 캐시 문제

---

## ✅ 해결 방법

### 1단계: NS 레코드 설정 확인 (가장 중요!)

내도메인.한국 사이트에서 확인:

1. **내도메인.한국 사이트** 접속
   - https://xn--220b31d95hq8o.xn--3e0b707e/

2. **도메인 관리** 페이지 접속

3. **chopplan.kro.kr** 도메인 선택

4. **NS 레코드 확인:**
   다음 4개의 네임서버가 설정되어 있어야 함:
   ```
   ns-1494.awsdns-58.org
   ns-1708.awsdns-21.co.uk
   ns-9.awsdns-01.com
   ns-760.awsdns-31.net
   ```

5. **다른 레코드 삭제:**
   - A 레코드 삭제 (api.chopplan.kro.kr 제외하고 Route53에서 관리하는 것들)
   - CNAME 레코드 삭제 (ACM 검증용 제외)

---

### 2단계: DNS 전파 확인

#### 온라인 도구로 확인:
1. https://www.whatsmydns.net/ 접속
2. 도메인: `chopplan.kro.kr` 입력
3. Record type: **NS** 선택
4. 전 세계 DNS 서버에서 NS 레코드 확인
5. Route53 네임서버 4개가 표시되는지 확인

#### 명령어로 확인:
```bash
# NS 레코드 확인
nslookup -type=NS chopplan.kro.kr

# www 도메인 확인
nslookup www.chopplan.kro.kr
```

---

### 3단계: DNS 캐시 플러시 (로컬)

#### Windows:
```powershell
ipconfig /flushdns
```

#### 브라우저 캐시:
- Chrome: Ctrl+Shift+Delete → DNS 및 캐시된 이미지 파일 삭제
- 또는 시크릿 모드에서 접속 테스트

---

### 4단계: 다른 DNS 서버 사용

Google DNS 사용:
```powershell
# 8.8.8.8 DNS 서버로 조회
nslookup www.chopplan.kro.kr 8.8.8.8
```

---

## 🔍 단계별 진단

### 확인 사항:

1. **내도메인.한국 사이트:**
   - [ ] NS 레코드 4개 설정됨
   - [ ] 다른 A/CNAME 레코드 삭제됨

2. **Route53:**
   - [x] www 레코드 설정됨
   - [x] api 레코드 설정됨

3. **CloudFront:**
   - [x] 커스텀 도메인 설정됨
   - [x] SSL 인증서 연결됨

4. **DNS 전파:**
   - [ ] NS 레코드 전파 완료됨
   - [ ] www 도메인 조회 성공

---

## 💡 임시 해결책

DNS 전파가 완료될 때까지 (1-2시간):

### 방법 1: CloudFront URL 직접 사용
```
Frontend: https://dpt8rhufx9b4x.cloudfront.net
Backend: https://api.chopplan.kro.kr/api (이미 작동 중!)
```

### 방법 2: 로컬 hosts 파일 수정 (개발/테스트용)

**Windows hosts 파일 위치:**
`C:\Windows\System32\drivers\etc\hosts`

**관리자 권한으로 편집:**
```
3.37.176.10 www.chopplan.kro.kr
3.37.176.10 chopplan.kro.kr
```

**⚠️ 주의:** 이 방법은 로컬에서만 작동하며, CloudFront를 거치지 않습니다.
더 나은 방법은 방법 1을 사용하는 것입니다.

---

## 📋 체크리스트

- [ ] 내도메인.한국 사이트에서 NS 레코드 설정 확인
- [ ] NS 레코드가 Route53 네임서버 4개로 설정됨
- [ ] 다른 레코드(A, CNAME) 삭제됨
- [ ] 온라인 도구로 NS 레코드 전파 확인
- [ ] DNS 캐시 플러시 (ipconfig /flushdns)
- [ ] 브라우저 캐시 삭제
- [ ] 1-2시간 대기 (DNS 전파)
- [ ] 접속 테스트

---

## 🆘 문제가 계속되면

### 1. 내도메인.한국 사이트 고객 지원 문의
- 이메일: pkquell+dnsze.com@gmail.com
- NS 레코드 설정 방법 문의

### 2. WHOIS 조회로 등록 업체 확인
- https://whois.net/
- 도메인: `chopplan.kro.kr` 입력
- 등록 업체 및 네임서버 정보 확인

### 3. Route53에서 도메인 등록 확인
- Route53에서 직접 도메인을 등록했는지 확인
- 외부에서 등록했다면 네임서버 변경 필요

---

## ⏰ 예상 소요 시간

- **NS 레코드 설정**: 즉시 (5분)
- **DNS 전파**: 1-48시간 (보통 1-2시간)
- **총 예상 시간**: 1-3시간

---

## ✅ 성공 확인 방법

DNS 전파가 완료되면:

```bash
nslookup www.chopplan.kro.kr
```

**예상 결과:**
```
www.chopplan.kro.kr
  -> dpt8rhufx9b4x.cloudfront.net
  -> CloudFront IP 주소들
```

그리고 브라우저에서:
- https://www.chopplan.kro.kr 접속 성공
- 모든 정적 파일 로드 성공

---

**내도메인.한국 사이트에서 NS 레코드 설정을 확인해주세요!** 이것이 가장 중요합니다. 🚀

