# 📝 Route53에서 레코드 생성하기

## 🎯 목표

Route53에서 다음 2개의 레코드를 생성해야 합니다:
1. **www** 레코드 → CloudFront Distribution
2. **api** 레코드 → EC2 IP (3.37.176.10)

---

## ✅ 방법 1: AWS 콘솔에서 생성 (권장)

### www 레코드 생성 (CloudFront용)

1. **Route53 콘솔** 접속
   - https://console.aws.amazon.com/route53/

2. **Hosted zones** 클릭
   - 왼쪽 메뉴 → **Hosted zones**

3. **chopplan.kro.kr** 선택

4. **Create record** 버튼 클릭

5. **www 레코드 설정:**
   ```
   Record name: www
   Record type: A
   
   ✅ Alias 활성화 (Alias toggle ON)
   Route traffic to: Alias to CloudFront distribution
   Region: Global (CloudFront)
   CloudFront distribution: E285T5MAAKCZRR 선택
   
   Routing policy: Simple routing
   Evaluate target health: No
   ```

6. **Create records** 클릭

---

### api 레코드 생성 (EC2용)

1. 같은 페이지에서 **Create record** 버튼 다시 클릭

2. **api 레코드 설정:**
   ```
   Record name: api
   Record type: A
   
   ❌ Alias 비활성화 (Alias toggle OFF)
   Value: 3.37.176.10
   
   Routing policy: Simple routing
   TTL: 300 (5분)
   ```

3. **Create records** 클릭

---

## ✅ 방법 2: AWS CLI로 생성

### www 레코드 생성

```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id Z00048092TE2J0UTLYT32 \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "www.chopplan.kro.kr",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "Z2FDTNDATAQYW2",
                    "DNSName": "dpt8rhufx9b4x.cloudfront.net",
                    "EvaluateTargetHealth": false
                }
            }
        }]
    }'
```

### api 레코드 생성

```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id Z00048092TE2J0UTLYT32 \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "api.chopplan.kro.kr",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [{"Value": "3.37.176.10"}]
            }
        }]
    }'
```

---

## 🔍 레코드 확인

생성 후 확인:

```bash
aws route53 list-resource-record-sets \
    --hosted-zone-id Z00048092TE2J0UTLYT32 \
    --query "ResourceRecordSets[?Type=='A'].{Name:Name,Type:Type,Value:ResourceRecords[0].Value,Alias:AliasTarget.DNSName}" \
    --output table
```

---

## ⚠️ 문제 해결

### "레코드가 이미 존재합니다" 오류

이미 레코드가 있다면:
```bash
# 기존 레코드 확인
aws route53 list-resource-record-sets \
    --hosted-zone-id Z00048092TE2J0UTLYT32 \
    --query "ResourceRecordSets[?Name=='www.chopplan.kro.kr.' || Name=='api.chopplan.kro.kr.']"
```

레코드가 있다면:
- AWS 콘솔에서 **Edit** 클릭하여 수정
- 또는 **DELETE** 후 다시 생성

### "Alias를 선택할 수 없습니다"

CloudFront Distribution ID를 확인:
```bash
aws cloudfront get-distribution --id E285T5MAAKCZRR --query 'Distribution.DomainName'
```

---

## 📋 체크리스트

- [ ] www 레코드 생성됨 (CloudFront로)
- [ ] api 레코드 생성됨 (3.37.176.10로)
- [ ] 레코드 확인 완료
- [ ] 1-2시간 대기 (DNS 전파)
- [ ] nslookup으로 확인

