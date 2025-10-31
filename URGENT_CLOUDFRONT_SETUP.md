# 🚨 긴급: CloudFront 커스텀 도메인 설정 필요!

## ❌ 현재 문제

CloudFront에 커스텀 도메인이 설정되지 않아서 `www.chopplan.kro.kr` 접속이 불가능합니다.

확인 결과:
- ❌ `Aliases: null` → 커스텀 도메인 미설정
- ❌ `ViewerCertificate: null` → SSL 인증서 미연결
- ✅ Route53 레코드는 정상 설정됨
- ✅ api 도메인은 정상 작동 중

---

## ✅ 즉시 해야 할 작업

### CloudFront 콘솔에서 설정:

1. **CloudFront 콘솔** 접속
   - https://console.aws.amazon.com/cloudfront/

2. **Distribution ID: E285T5MAAKCZRR** 선택

3. **General** 탭 → **Edit** 버튼 클릭

4. **Settings** 섹션에서 **Edit** 클릭

5. **Alternate domain names (CNAMEs)** 섹션:
   - **Add another item** 클릭
   - `www.chopplan.kro.kr` 입력

6. **Custom SSL certificate** 섹션:
   - **Custom SSL certificate (example.com)** 선택
   - 드롭다운에서 다음 인증서 선택:
     ```
     Domain: chopplan.kro.kr
     ARN: arn:aws:acm:us-east-1:107916452360:certificate/97900981-f84f-4a76-9ef8-ebd251b749a3
     ```
   - 또는 Domain name이 `chopplan.kro.kr`이고 Status가 `ISSUED`인 인증서 선택

7. **Save changes** 클릭

8. **배포 완료 대기** (15-30분)
   - Distribution Status가 **Deployed**가 될 때까지 대기
   - 페이지를 새로고침하면 상태 확인 가능

---

## ⏰ 예상 소요 시간

1. **CloudFront 설정**: 5분
2. **배포 완료 대기**: 15-30분
3. **DNS 전파 대기**: 1-2시간 (이미 Route53에 레코드가 있으므로 빠를 수 있음)

**총 예상 시간: 1-2시간**

---

## ✅ 설정 완료 후 확인

### 명령어로 확인:
```bash
aws cloudfront get-distribution --id E285T5MAAKCZRR \
    --query 'Distribution.{Status:Status,Aliases:Aliases.Items,ViewerCertificate:ViewerCertificate.Certificate}' \
    --output json
```

### 예상 결과:
```json
{
    "Status": "Deployed",
    "Aliases": ["www.chopplan.kro.kr"],
    "ViewerCertificate": "arn:aws:acm:us-east-1:..."
}
```

### DNS 확인:
```bash
nslookup www.chopplan.kro.kr
```

### 브라우저에서 접속:
- https://www.chopplan.kro.kr

---

## 📋 체크리스트

설정 전:
- [x] Route53 레코드 설정 완료
- [x] ACM 인증서 발급 완료
- [x] S3 배포 완료
- [ ] CloudFront 커스텀 도메인 설정 ← **지금 해야 할 일!**

설정 후:
- [ ] CloudFront 배포 완료 (Status: Deployed)
- [ ] DNS 전파 완료 (nslookup 성공)
- [ ] 브라우저 접속 성공

---

## 💡 중요 참고사항

1. **리전 확인**: ACM 인증서는 **us-east-1** 리전에서 발급된 것을 사용해야 합니다.

2. **배포 시간**: CloudFront 설정 변경 후 배포되는데 15-30분이 걸립니다.

3. **DNS 전파**: CloudFront 배포 완료 후 DNS 전파까지 1-2시간 추가로 걸릴 수 있습니다.

4. **임시 해결책**: CloudFront 설정 완료 전까지는 다음 URL 사용 가능:
   - Frontend: https://dpt8rhufx9b4x.cloudfront.net
   - Backend API: https://api.chopplan.kro.kr/api (이미 작동 중!)

---

설정 완료하시면 알려주세요! 확인해드리겠습니다. 🚀

