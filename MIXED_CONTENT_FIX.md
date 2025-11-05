# 🔒 Mixed Content 문제 해결 가이드

## ❌ 문제 상황

CloudFront URL (`https://dpt8rhufx9b4x.cloudfront.net`)에서 로그인 시도 시:

1. **Mixed Content 경고**:
   ```
   Mixed Content: The page at 'https://...' was loaded over HTTPS, 
   but requested an insecure XMLHttpRequest endpoint 'http://...'
   ```

2. **400 오류**: 로그인 요청이 실패

3. **403 오류**: 일부 리소스 로딩 실패

## 🔍 원인

- **HTTPS 페이지** (CloudFront)에서 **HTTP API** (`http://api.chopplan.kro.kr:8080`) 호출
- 브라우저 보안 정책으로 인해 일부 브라우저는 Mixed Content를 차단할 수 있음
- EC2 서버는 현재 HTTP만 지원함

## ✅ 해결 방법

### 방법 1: ALB를 통한 HTTPS 제공 (권장)

Application Load Balancer를 사용하여 API에도 HTTPS를 제공:

1. **ALB 생성** (HTTPS 리스너)
2. **ACM 인증서** 사용 (API 서브도메인용)
3. **Route53 레코드** 수정 (ALB로 라우팅)
4. **프론트엔드 API URL** 변경 (`https://api.chopplan.kro.kr/api`)

### 방법 2: Nginx 리버스 프록시 (EC2에 설치)

EC2에 Nginx를 설치하여 HTTPS를 제공:

1. **Nginx 설치** 및 설정
2. **SSL 인증서** 설정 (Let's Encrypt 등)
3. **리버스 프록시** 설정 (8080 포트로 프록시)

### 방법 3: CloudFront를 API 프록시로 사용

CloudFront Distribution을 하나 더 만들어서 API도 HTTPS로 제공:

1. **새 CloudFront Distribution** 생성
2. **Origin**: EC2 서버
3. **Custom Domain**: `api.chopplan.kro.kr`
4. **SSL 인증서** 연결

### 방법 4: 임시 해결책 (브라우저 설정)

개발/테스트 용도로만 사용:

**Chrome:**
- Chrome 실행 시: `chrome.exe --disable-web-security --user-data-dir="C:/chrome-dev"`
- 또는: `chrome://flags/#block-insecure-private-network-requests` 비활성화

**주의**: 프로덕션에서는 사용하지 마세요!

---

## 📋 현재 권장 사항

프로덕션 환경에서는 **방법 1 (ALB)** 또는 **방법 3 (CloudFront API 프록시)**를 사용하는 것이 좋습니다.

임시로는 도메인 URL (`https://www.chopplan.kro.kr`)에서 접속하면 같은 문제가 발생하지 않을 수 있습니다 (브라우저 정책에 따라 다름).

---

## 🔧 빠른 테스트

도메인 URL에서 접속해보세요:
```
https://www.chopplan.kro.kr/login
```

CloudFront URL과 다른 동작을 할 수 있습니다.





