# 🔧 중복 레코드 문제 해결하기

## ❌ 문제 원인

NS 레코드를 Route53으로 설정하면, **Route53이 모든 DNS를 관리**합니다.
따라서 도메인 등록 사이트(내도메인.한국)에서 **다른 레코드(A, CNAME 등)를 설정하면 안 됩니다**.

현재 설정:
- ✅ NS 레코드: Route53으로 설정됨 (정상)
- ❌ A 레코드 (api): 이 사이트에서 설정됨 (문제!)
- ❌ CNAME 레코드: 이 사이트에서 설정됨 (문제!)

---

## ✅ 해결 방법

### 1단계: 도메인 등록 사이트에서 레코드 삭제

내도메인.한국 사이트에서:

1. **A 레코드 삭제:**
   - `api.chopplan.kro.kr -> 3.37.176.10` 삭제
   - [-] 버튼 클릭

2. **CNAME 레코드 삭제 (ACM 검증용은 제외):**
   - ACM 인증서 검증용 CNAME 레코드는 Route53에도 있어야 함
   - 일단 이 사이트에서는 삭제해도 됨 (Route53에 있을 경우)

**남겨야 할 것:**
- ✅ NS 레코드 4개만 남기기:
  ```
  ns-1494.awsdns-58.org
  ns-1708.awsdns-21.co.uk
  ns-9.awsdns-01.com
  ns-760.awsdns-31.net
  ```

**삭제해야 할 것:**
- ❌ A 레코드 (api.chopplan.kro.kr)
- ❌ CNAME 레코드들 (ACM 검증용은 Route53에 있으면 괜찮음)

---

### 2단계: Route53에서 레코드 생성

도메인 등록 사이트에서 레코드를 삭제한 후, **Route53에서 레코드를 생성**해야 합니다.

#### Route53 콘솔에서:

1. **Route53 콘솔** 접속
2. **Hosted zones** → **chopplan.kro.kr** 선택
3. **Create record** 클릭

#### www 레코드 생성 (CloudFront용):

```
Record name: www
Record type: A
Alias: Yes
Route traffic to: CloudFront distribution
Distribution: E285T5MAAKCZRR 선택
```

#### api 레코드 생성 (EC2용):

**중요:** 현재 설정된 IP `3.37.176.10`이 올바른 EC2 IP인지 확인하세요.
올바른 EC2 IP는: `52.78.137.215` (또는 EC2 퍼블릭 IP)

```
Record name: api
Record type: A
Alias: No
Value: 52.78.137.215 (또는 올바른 EC2 IP)
TTL: 300
```

---

### 3단계: CloudFront 설정 확인

1. **CloudFront 콘솔** 접속
2. Distribution **E285T5MAAKCZRR** 선택
3. **General** 탭 → **Edit** 클릭
4. **Alternate domain names (CNAMEs)** 확인:
   - `www.chopplan.kro.kr` 추가되어 있어야 함
5. **Custom SSL certificate** 확인:
   - ACM 인증서 선택되어 있어야 함 (us-east-1 리전)
6. 저장 후 배포 완료 대기 (15-30분)

---

## 📋 체크리스트

도메인 등록 사이트 (내도메인.한국):
- [ ] A 레코드 (api) 삭제
- [ ] CNAME 레코드 삭제 (ACM 검증용 제외)
- [ ] NS 레코드 4개만 남기기

Route53:
- [ ] www 레코드 생성 (CloudFront로)
- [ ] api 레코드 생성 (EC2 IP로)

CloudFront:
- [ ] 커스텀 도메인 추가됨 (www.chopplan.kro.kr)
- [ ] SSL 인증서 연결됨
- [ ] 배포 완료됨

---

## ⚠️ 주의사항

### IP 주소 확인:
현재 설정된 `3.37.176.10`이 올바른 EC2 IP인지 확인하세요.

올바른 EC2 IP 확인:
```bash
# EC2 인스턴스의 퍼블릭 IP 확인
aws ec2 describe-instances --filters "Name=tag:Name,Values=*" --query "Reservations[*].Instances[*].[PublicIpAddress]" --output table
```

또는 EC2 콘솔에서 확인:
- EC2 인스턴스 → Public IPv4 address 확인

---

## 🔍 확인 방법

설정 완료 후 1-2시간 기다린 후:

```bash
# DNS 조회
nslookup www.chopplan.kro.kr
nslookup api.chopplan.kro.kr

# 온라인 도구
# https://www.whatsmydns.net/
```

---

## 💡 요약

1. **내도메인.한국 사이트**: A 레코드, CNAME 레코드 삭제 → NS 레코드만 남기기
2. **Route53**: www 레코드, api 레코드 생성
3. **CloudFront**: 커스텀 도메인 설정 확인
4. **대기**: 1-2시간 (DNS 전파)
5. **확인**: nslookup 또는 브라우저 접속

