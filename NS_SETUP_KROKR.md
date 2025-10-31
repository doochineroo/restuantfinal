# 🔧 kro.kr 도메인 사이트에서 NS 레코드 설정하기

도메인 관리 사이트: https://xn--220b31d95hq8o.xn--3e0b707e/ (내도메인.한국)

---

## 📋 1단계: Route53 NS 레코드 확인

Route53에서 제공하는 네임서버 주소를 확인하세요:

```bash
aws route53 get-hosted-zone --id Z00048092TE2J0UTLYT32 --query 'DelegationSet.NameServers'
```

위 명령어로 확인한 4개의 네임서버 주소를 복사하세요.

**예시 NS 레코드:**
```
ns-1234.awsdns-12.com
ns-5678.awsdns-56.net
ns-9012.awsdns-90.org
ns-3456.awsdns-34.co.uk
```

---

## 🌐 2단계: 내도메인.한국 사이트에서 설정

### 1. 사이트 접속 및 로그인
1. **https://xn--220b31d95hq8o.xn--3e0b707e/** 접속
2. 로그인 (도메인 등록 시 사용한 계정)

### 2. 도메인 관리 페이지 접속
1. 메뉴에서 **"도메인 관리"** 또는 **"도메인 관리"** 클릭
2. 또는 URL: `/page/domain_conf_list.php`

### 3. chopplan.kro.kr 도메인 선택
1. 도메인 목록에서 **chopplan.kro.kr** 찾기
2. 도메인 클릭 또는 **"관리"** 버튼 클릭

### 4. DNS/네임서버 설정 찾기
일반적으로 다음 중 하나의 이름으로 되어 있습니다:
- **DNS 설정**
- **네임서버 설정**
- **Nameservers**
- **DNS 관리**
- **DNS Zone 설정**

### 5. 네임서버 변경
1. **Custom Nameservers** 또는 **자체 네임서버 사용** 선택
2. **네임서버 1, 2, 3, 4** 입력란에 Route53 NS 레코드 4개 입력:
   ```
   네임서버 1: ns-xxxx.awsdns-xx.com
   네임서버 2: ns-xxxx.awsdns-xx.net
   네임서버 3: ns-xxxx.awsdns-xx.org
   네임서버 4: ns-xxxx.awsdns-xx.co.uk
   ```
3. **저장** 또는 **적용** 버튼 클릭

---

## ⚠️ 만약 네임서버 설정 메뉴가 없다면

일부 도메인 사이트는 네임서버 대신 **A 레코드 직접 설정**을 지원합니다.
이 경우:

### A 레코드 직접 설정 방법:

1. **DNS 설정** 또는 **DNS Zone 관리** 메뉴
2. 레코드 추가:
   ```
   www (또는 @) - A 레코드 - CloudFront IP (또는 CNAME)
   api - A 레코드 - 52.78.137.215
   ```
   
**하지만**, Route53을 사용하려면 **네임서버 변경**이 더 좋습니다.

---

## ✅ 3단계: 설정 확인

설정 후 1-2시간 기다린 후 확인:

```bash
# DNS 전파 확인
nslookup chopplan.kro.kr
```

또는 온라인 도구:
- https://www.whatsmydns.net/
- 도메인: `chopplan.kro.kr` 입력

---

## 📝 빠른 체크리스트

- [ ] 내도메인.한국 사이트 로그인
- [ ] 도메인 관리 메뉴 접속
- [ ] chopplan.kro.kr 도메인 선택
- [ ] DNS/네임서버 설정 메뉴 찾기
- [ ] Route53 NS 레코드 4개 입력
- [ ] 저장/적용
- [ ] 1-2시간 대기
- [ ] nslookup으로 확인

---

## 🆘 문제 해결

### "네임서버 설정 메뉴를 찾을 수 없어요"

1. **고객 지원 문의**
   - 사이트 하단 **"이메일문의"** 클릭
   - pkquell+dnsze.com@gmail.com

2. **메뉴 이름 확인**
   - 도메인 관리 페이지에서 "DNS", "네임서버", "Nameserver" 등 검색

3. **직접 A 레코드 설정**
   - 네임서버 설정이 불가능하다면 A 레코드 직접 설정
   - 단, Route53의 모든 기능을 사용할 수 없음

---

## 💡 참고

- **네임서버 변경** 후 DNS 전파는 보통 1-48시간이 걸립니다
- 보통은 **1-2시간** 내에 전파됩니다
- 전파가 완료되면 `www.chopplan.kro.kr` 접속 가능합니다

