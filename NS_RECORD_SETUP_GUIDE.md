# 🔧 NS 레코드 설정 완벽 가이드

## 📋 NS 레코드란?

NS(Name Server) 레코드는 "이 도메인의 DNS를 누가 관리할까?"를 지정하는 레코드입니다.
Route53에서 호스팅 영역을 만들면, Route53이 제공하는 네임서버 주소를 도메인 등록 업체에 설정해야 합니다.

---

## 🔍 1단계: Route53에서 NS 레코드 확인

### AWS CLI로 확인:
```bash
aws route53 get-hosted-zone --id YOUR_HOSTED_ZONE_ID --query 'DelegationSet.NameServers' --output table
```

### AWS 콘솔에서 확인:
1. **Route53 콘솔** 접속
2. **Hosted zones** 클릭
3. **chopplan.kro.kr** 선택
4. 자동으로 생성된 **NS 레코드** 확인
   - 4개의 네임서버 주소가 표시됨
   - 예: `ns-xxx.awsdns-xx.com`, `ns-yyy.awsdns-yy.com` 등

**예시 NS 레코드:**
```
ns-1234.awsdns-12.com
ns-5678.awsdns-56.net
ns-9012.awsdns-90.org
ns-3456.awsdns-34.co.uk
```

---

## 🌐 2단계: kro.kr 도메인 등록 사이트 찾기

kro.kr은 무료 도메인 서비스입니다. 보통 다음 중 하나에서 등록했을 것입니다:

### 가능한 등록 사이트:
1. **FreeNom** - https://freenom.com
2. **Dot TK** - https://www.dot.tk/
3. **기타 무료 도메인 서비스**

### 도메인 등록 사이트 확인 방법:
1. 도메인을 등록한 이메일 확인
2. 도메인 등록 시 사용한 계정 확인
3. 브라우저 북마크 확인

---

## ⚙️ 3단계: 도메인 등록 사이트에서 네임서버 변경

### 방법 A: FreeNom 사용하는 경우

1. **FreeNom 로그인**
   - https://freenom.com 접속
   - 계정으로 로그인

2. **도메인 관리 페이지 접속**
   - **My Domains** 또는 **Services** → **My Domains** 클릭
   - `chopplan.kro.kr` 도메인 찾기

3. **DNS 설정 찾기**
   - 도메인 옆 **Manage Domain** 또는 **관리** 클릭
   - **Management Tools** → **Nameservers** 클릭

4. **네임서버 변경**
   - **Use custom nameservers** 또는 **Use own nameservers** 선택
   - Route53에서 확인한 4개 NS 레코드 입력:
     ```
     ns-1234.awsdns-12.com
     ns-5678.awsdns-56.net
     ns-9012.awsdns-90.org
     ns-3456.awsdns-34.co.uk
     ```
   - **Change Nameservers** 또는 **저장** 클릭

5. **변경 완료 대기**
   - 변경 후 1-48시간 내 전파됨 (보통 1-2시간)

---

### 방법 B: Dot TK 사용하는 경우

1. **Dot TK 로그인**
   - https://www.dot.tk/ 접속
   - 계정으로 로그인

2. **도메인 관리**
   - **My Account** → **Domain List**
   - `chopplan.kro.kr` 선택

3. **네임서버 설정**
   - **DNS Settings** 또는 **Nameservers** 메뉴
   - **Custom Nameservers** 선택
   - Route53 NS 레코드 4개 입력
   - **Save** 클릭

---

### 방법 C: 기타 도메인 등록 업체

일반적인 절차:

1. **도메인 등록 사이트 로그인**
2. **도메인 관리** 또는 **My Domains** 메뉴
3. **chopplan.kro.kr** 도메인 선택
4. **DNS 설정** 또는 **Nameservers** 메뉴 찾기
   - 보통 **DNS**, **Nameservers**, **DNS Settings** 등의 이름
5. **Custom Nameservers** 또는 **Use own nameservers** 선택
6. Route53 NS 레코드 4개 입력
7. **저장** 또는 **Apply** 클릭

---

## ✅ 4단계: 설정 확인

### DNS 전파 확인:

```bash
# Windows PowerShell
nslookup chopplan.kro.kr

# 또는 온라인 도구 사용
# https://www.whatsmydns.net/
# 도메인: chopplan.kro.kr 입력
```

### 확인해야 할 것:
- NS 레코드가 Route53의 네임서버로 변경되었는지
- 4개의 네임서버가 모두 표시되는지

**성공 예시:**
```
Server:  ns-1234.awsdns-12.com
Address:  192.0.2.1
```

---

## ⏰ 전파 시간

- **보통**: 1-2시간
- **최대**: 24-48시간
- **즉시**: 경우에 따라 10-30분

전파가 완료되면:
- `www.chopplan.kro.kr` 접속 가능
- `api.chopplan.kro.kr` 접속 가능

---

## 🆘 문제 해결

### NS 레코드가 변경되지 않는 경우:

1. **도메인 등록 사이트에서 확인**
   - 네임서버 변경이 실제로 저장되었는지
   - 오타가 없는지 확인

2. **Route53 NS 레코드 확인**
   - 올바른 NS 레코드를 사용했는지

3. **DNS 캐시 확인**
   - 브라우저 캐시 삭제
   - 다른 DNS 서버로 확인 (예: 8.8.8.8)

### "도메인 등록 사이트를 모르겠어요" 경우:

1. **도메인 등록 이메일 확인**
   - 도메인 등록 시 받은 이메일에서 확인

2. **WHOIS 조회**
   - https://whois.net/ 접속
   - `chopplan.kro.kr` 입력
   - Registrar 정보 확인

3. **DNS 설정 직접 변경**
   - 일부 도메인 등록 사이트는 A 레코드를 직접 설정할 수 있음
   - 이 경우 Route53 대신 직접 A 레코드 설정 가능

---

## 💡 빠른 체크리스트

- [ ] Route53에서 NS 레코드 4개 확인
- [ ] 도메인 등록 사이트 로그인
- [ ] 네임서버 설정 메뉴 찾기
- [ ] Custom Nameservers 선택
- [ ] Route53 NS 레코드 4개 입력
- [ ] 저장
- [ ] 1-2시간 대기
- [ ] nslookup으로 확인

---

## 📞 추가 도움이 필요하면

만약 도메인 등록 사이트를 찾을 수 없다면:
- 등록 시 사용한 이메일 확인
- WHOIS 조회로 등록 업체 확인
- 또는 Route53에서 도메인을 직접 등록/이전 고려

