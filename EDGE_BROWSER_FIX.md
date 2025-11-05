# 🔧 엣지 브라우저 연결 문제 해결

## 문제점

크롬에서는 로그인이 되지만 엣지에서는 서버 연결이 안 됩니다.

## 가능한 원인

### 1. Mixed Content 정책 차이
- **크롬**: Mixed Content 경고를 보여주지만 요청은 진행
- **엣지**: Mixed Content를 더 엄격하게 차단할 수 있음
  - HTTPS 페이지(`https://dpt8rhufx9b4x.cloudfront.net/`)에서 HTTP API 호출(`http://ec2-3-37-176-10...`) 시 차단

### 2. 브라우저 캐시 차이
- 엣지가 이전 빌드 파일을 캐시하고 있을 수 있음

### 3. 보안 설정
- 엣지의 엄격한 보안 설정이 Mixed Content를 차단

## 해결 방법

### 방법 1: 엣지 브라우저 캐시 삭제

1. **엣지 설정**:
   - `Ctrl + Shift + Delete` (캐시 삭제 창 열기)
   - "캐시된 이미지 및 파일" 선택
   - "지금 지우기" 클릭

2. **강제 새로고침**:
   - `Ctrl + Shift + R` 또는 `Ctrl + F5`

3. **개발자 도구**:
   - `F12`로 개발자 도구 열기
   - Network 탭 → "캐시 사용 안 함" 체크
   - 페이지 새로고침

### 방법 2: 엣지 보안 설정 변경 (임시 해결)

1. **엣지 주소창**에 입력:
   ```
   edge://settings/privacy
   ```

2. **보안 설정**:
   - "추적 방지" → "기본값" 선택
   - "추적 차단" 기능이 Mixed Content를 차단할 수 있음

3. **사이트 설정**:
   - `edge://settings/content/siteDetails`
   - CloudFront URL 추가
   - "안전하지 않은 콘텐츠" 허용 (임시)

### 방법 3: 엣지 개발자 도구에서 확인

1. **개발자 도구** (`F12`) 열기
2. **Console 탭** 확인:
   - Mixed Content 오류 메시지 확인
   - 네트워크 오류 메시지 확인

3. **Network 탭** 확인:
   - API 요청이 실제로 전송되는지 확인
   - 요청 상태 코드 확인 (403, 500 등)
   - "Mixed Content" 경고 확인

### 방법 4: 임시 테스트 - HTTP 프론트엔드 사용

**주의**: 보안상 권장하지 않지만, 테스트용으로만 사용

1. EC2 인스턴스에서 직접 프론트엔드 서빙 (HTTP)
2. CloudFront 없이 테스트
3. Mixed Content 경고 없이 작동하는지 확인

## 근본적인 해결 방법 (권장)

### API에 HTTPS 추가

1. **Application Load Balancer (ALB) 사용**:
   - EC2 앞에 ALB 배치
   - SSL/TLS 인증서 적용 (ACM)
   - HTTPS 포트 (443) 리스너 추가

2. **Nginx 리버스 프록시**:
   - EC2에 Nginx 설치
   - SSL 인증서 설정 (Let's Encrypt)
   - HTTP → HTTPS 리다이렉트

3. **CloudFront API Gateway**:
   - CloudFront를 API 프록시로 사용
   - HTTPS API 엔드포인트 제공

## 현재 상태 확인

### API 서버 연결 테스트
```bash
curl -X POST http://ec2-3-37-176-10.ap-northeast-2.compute.amazonaws.com:8080/api/demo/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### 브라우저별 Mixed Content 정책
- **크롬**: Mixed Content 경고, 요청 진행
- **엣지**: Mixed Content 차단 가능성 높음
- **Firefox**: Mixed Content 경고, 요청 진행

## 권장 조치

1. **즉시 조치**: 엣지 캐시 삭제 및 강제 새로고침
2. **단기 조치**: 엣지 보안 설정 조정 (임시)
3. **장기 조치**: API에 HTTPS 적용 (ALB 또는 Nginx)

---

**중요**: Mixed Content는 보안 취약점이므로, 프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다!





