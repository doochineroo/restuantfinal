# 🔍 오류 분석 및 해결 가이드

## 발생한 오류들

### 1. Mixed Content 경고 ⚠️
**오류 메시지:**
```
Mixed Content: The page at 'https://dpt8rhufx9b4x.cloudfront.net/login' 
was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 
'http://api.chopplan.kro.kr:8080/api/demo/auth/login'
```

**의미:**
- HTTPS 페이지에서 HTTP API를 호출할 때 발생하는 보안 경고
- 브라우저가 Mixed Content를 감지함
- 대부분의 브라우저에서는 요청을 허용하지만 일부는 차단할 수 있음

**현재 상태:**
- ✅ 요청은 진행됨 (경고만 발생)
- ❌ 보안상 권장되지 않음

**해결 방법:**
1. **임시**: 도메인 URL 사용 (`https://www.chopplan.kro.kr`)
2. **영구**: API에도 HTTPS 제공 (ALB/Nginx/CloudFront 사용)

---

### 2. 400 Bad Request ❌
**오류 메시지:**
```
Failed to load resource: the server responded with a status of 400 ()
로그인/회원가입 오류: Nn
```

**의미:**
- 서버가 요청을 거부함
- `AuthController`에서 예외 발생 시 400 반환

**가능한 원인:**
1. **사용자 없음**: "사용자를 찾을 수 없습니다"
2. **비밀번호 불일치**: "비밀번호가 일치하지 않습니다"
3. **계정 비활성화**: "계정이 비활성화되었습니다"
4. **요청 데이터 문제**: 필수 필드 누락, 형식 오류

**확인 방법:**
- 개발자 도구 → Network 탭 → 요청 상세 보기
- Response 탭에서 서버 오류 메시지 확인
- Console 탭에서 더 자세한 오류 확인

**해결 방법:**
- 올바른 사용자 정보로 로그인 시도
- 서버 로그 확인 (EC2에서 확인)
- 데이터베이스에 사용자 존재 여부 확인

---

### 3. 403 Forbidden 🚫
**오류 메시지:**
```
login:1 Failed to load resource: the server responded with a status of 403
```

**의미:**
- 리소스 접근 권한 없음
- 서버가 요청을 거부함

**가능한 원인:**
1. **보안 설정**: Spring Security가 요청을 차단
2. **CORS 문제**: Origin 차단 (하지만 현재 `*` 허용)
3. **인증 필요**: 로그인이 필요한 리소스 접근

**확인 방법:**
- 요청 URL 확인
- 서버 로그 확인
- CORS 설정 확인

---

## 🔧 즉시 해결 방법

### 임시 해결책
1. **도메인 URL 사용**:
   ```
   https://www.chopplan.kro.kr/login
   ```
   - Mixed Content 경고 발생 가능성 낮음
   - 브라우저 정책에 따라 다름

2. **올바른 로그인 정보 확인**:
   - 사용자명/비밀번호 확인
   - 테스트 계정이 DB에 있는지 확인

### 영구 해결책
1. **API에 HTTPS 제공**:
   - ALB (Application Load Balancer) 사용
   - 또는 CloudFront를 API 프록시로 사용
   - 또는 Nginx 리버스 프록시 설정

2. **서버 로그 확인**:
   - EC2에 접속하여 Spring Boot 로그 확인
   - 정확한 오류 원인 파악

---

## 📋 체크리스트

- [ ] Mixed Content 경고 확인됨 (경고만 발생, 요청은 진행)
- [ ] 400 오류 원인 확인 (사용자 정보 확인)
- [ ] 403 오류 원인 확인 (서버 로그 확인)
- [ ] 도메인 URL에서 테스트 (`https://www.chopplan.kro.kr/login`)
- [ ] 서버 로그 확인 (EC2 접속)

---

## 💡 권장 사항

1. **개발/테스트**: 도메인 URL 사용 (`www.chopplan.kro.kr`)
2. **프로덕션**: API에 HTTPS 제공 (ALB 또는 CloudFront 사용)
3. **디버깅**: 서버 로그를 통해 정확한 오류 원인 확인





