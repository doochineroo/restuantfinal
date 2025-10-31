# 🔧 CloudFront 커스텀 도메인 설정하기

## ❌ 현재 문제

CloudFront Distribution에 커스텀 도메인이 설정되지 않았습니다:
- `Aliases: null` → `www.chopplan.kro.kr`이 추가되지 않음
- `ViewerCertificate: null` → SSL 인증서가 연결되지 않음

---

## ✅ 해결 방법: AWS 콘솔에서 설정

### 1단계: CloudFront 콘솔 접속

1. **CloudFront 콘솔** 접속
   - https://console.aws.amazon.com/cloudfront/

2. **Distribution ID: E285T5MAAKCZRR** 선택

3. **General** 탭 → **Edit** 버튼 클릭

---

### 2단계: 커스텀 도메인 추가

1. **Settings** 섹션에서 **Edit** 클릭

2. **Alternate domain names (CNAMEs)** 찾기

3. **Add another item** 클릭

4. `www.chopplan.kro.kr` 입력

---

### 3단계: SSL 인증서 연결

1. **Custom SSL certificate** 섹션 찾기

2. **Request or Import a Certificate with ACM** 클릭
   - ACM 콘솔로 이동 (리전: **us-east-1**)

3. 또는 **Choose a certificate** 드롭다운에서 선택:
   - **Request or Import a Certificate with ACM** 클릭
   - ACM 콘솔에서 인증서 발급 (us-east-1 리전)
   - 발급 완료 후 돌아와서 인증서 선택

---

### 4단계: SSL 인증서 발급 (필요한 경우)

#### ACM 콘솔에서:
1. **Certificate Manager** 접속
2. **리전: us-east-1** 선택 (중요!)
3. **Request a certificate** 클릭
4. 설정:
   ```
   Certificate type: Request a public certificate
   Domain names:
     - chopplan.kro.kr
     - www.chopplan.kro.kr
     - api.chopplan.kro.kr
   Validation method: DNS validation
   ```
5. **DNS 검증:**
   - ACM에서 제공하는 CNAME 레코드를 Route53에 추가
   - 이미 Route53에 있으면 자동 검증됨

---

### 5단계: 저장 및 배포

1. **Save changes** 클릭

2. **Deploy** 대기 (15-30분)
   - Status가 **Deployed**가 될 때까지 대기

---

## ⚠️ 중요 사항

### 리전 확인:
- CloudFront용 인증서는 **반드시 us-east-1 리전**에서 발급해야 합니다!
- 다른 리전(ap-northeast-2 등)에서는 사용할 수 없습니다.

### DNS 전파:
- CloudFront 설정 완료 후 1-2시간 더 대기 (DNS 전파)
- 총 2-3시간 소요될 수 있습니다.

---

## 🔍 확인 방법

설정 완료 후 확인:

```bash
# CloudFront 설정 확인
aws cloudfront get-distribution --id E285T5MAAKCZRR \
    --query 'Distribution.{Aliases:Aliases.Items,ViewerCertificate:ViewerCertificate.Certificate}' \
    --output json

# Distribution Status 확인
aws cloudfront get-distribution --id E285T5MAAKCZRR \
    --query 'Distribution.Status' \
    --output text
```

---

## 📋 체크리스트

- [ ] CloudFront 콘솔에서 Distribution E285T5MAAKCZRR 선택
- [ ] General 탭 → Edit 클릭
- [ ] Alternate domain names에 `www.chopplan.kro.kr` 추가
- [ ] ACM 인증서 발급 (us-east-1 리전)
- [ ] Custom SSL certificate 선택
- [ ] Save changes 클릭
- [ ] 배포 완료 대기 (15-30분, Status: Deployed)
- [ ] DNS 전파 대기 (1-2시간)
- [ ] 접속 테스트

---

## 💡 빠른 방법

### ACM 인증서가 이미 있다면:
1. ACM 콘솔 (us-east-1)에서 인증서 확인
2. CloudFront에서 해당 인증서 선택

### ACM 인증서가 없다면:
1. ACM에서 인증서 발급 (us-east-1)
2. DNS 검증 완료 대기
3. CloudFront에서 인증서 선택

---

설정 완료 후 알려주세요!

