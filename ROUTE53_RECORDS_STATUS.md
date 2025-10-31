# 📋 Route53 레코드 현황 및 점검

## 현재 Route53 레코드 상태

### ✅ 정상 레코드들:

1. **chopplan.kro.kr (A 레코드 - 루트 도메인)**
   - CloudFront로 연결됨
   - ✅ 정상 (루트 도메인도 접속 가능)

2. **www.chopplan.kro.kr (A 레코드)**
   - CloudFront로 연결됨
   - ✅ 정상

3. **chopplan.kro.kr (NS 레코드)**
   - Route53 네임서버 4개
   - ✅ 정상 (자동 생성)

4. **chopplan.kro.kr (SOA 레코드)**
   - 시작 권한 레코드
   - ✅ 정상 (자동 생성)

5-7. **ACM 인증서 검증용 CNAME 레코드들**
   - SSL 인증서 검증용
   - ✅ 정상 (ACM 자동 생성)

---

## ❌ 문제: api 레코드가 없습니다!

**api.chopplan.kro.kr** A 레코드가 보이지 않습니다.

### 확인 필요:
```bash
aws route53 list-resource-record-sets \
    --hosted-zone-id Z00048092TE2J0UTLYT32 \
    --query "ResourceRecordSets[?contains(Name, 'api') && Type=='A']"
```

---

## 🔧 해결 방법

### api 레코드 생성

Route53 콘솔에서:
1. **Hosted zones** → **chopplan.kro.kr** 선택
2. **Create record** 클릭
3. 설정:
   ```
   Record name: api
   Record type: A
   Alias: No
   Value: 3.37.176.10
   TTL: 300
   ```
4. **Create records** 클릭

또는 AWS CLI로:
```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id Z00048092TE2J0UTLYT32 \
    --change-batch file://api-record.json
```

---

## 📊 레코드 요약

### 필요한 레코드:
- ✅ www.chopplan.kro.kr (A) → CloudFront
- ✅ chopplan.kro.kr (A) → CloudFront (루트 도메인)
- ❌ api.chopplan.kro.kr (A) → EC2 IP (생성 필요!)
- ✅ NS 레코드들 (자동 생성)
- ✅ SOA 레코드 (자동 생성)
- ✅ ACM 검증 CNAME들 (자동 생성)

### 불필요한 레코드:
없음 - 모든 레코드가 필요합니다.

---

## 🎯 다음 단계

1. **api 레코드 생성** 확인
2. **CloudFront 커스텀 도메인** 확인
3. **DNS 전파 대기** (1-2시간)
4. **접속 테스트**

---

## ✅ 체크리스트

- [ ] api.chopplan.kro.kr A 레코드 생성됨
- [ ] www.chopplan.kro.kr A 레코드 확인됨
- [ ] chopplan.kro.kr A 레코드 확인됨
- [ ] CloudFront 커스텀 도메인 설정됨
- [ ] DNS 전파 완료됨

