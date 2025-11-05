# 🌐 브라우저별 Mixed Content 정책 및 호환성

## 문제점

**다른 컴퓨터에서도 같은 문제가 발생할 수 있습니다!**

## 브라우저별 Mixed Content 정책

### ✅ 크롬 (Chrome)
- **정책**: Mixed Content 경고 표시, 요청은 진행
- **동작**: HTTPS 페이지에서 HTTP API 호출 시 경고만 발생, 요청은 정상 처리
- **상태**: ✅ 정상 작동

### ❌ 엣지 (Edge)
- **정책**: Mixed Content를 더 엄격하게 차단
- **동작**: HTTPS 페이지에서 HTTP API 호출 시 요청 차단 가능
- **상태**: ❌ 연결 실패 가능

### ⚠️ 파이어폭스 (Firefox)
- **정책**: Mixed Content 경고 표시, 요청은 진행
- **동작**: 크롬과 유사하지만 일부 버전에서는 차단 가능
- **상태**: ⚠️ 대부분 정상, 일부 차단 가능

### ❌ 사파리 (Safari)
- **정책**: Mixed Content를 매우 엄격하게 차단
- **동작**: HTTPS 페이지에서 HTTP API 호출 시 요청 차단
- **상태**: ❌ 연결 실패 가능

## 영향 범위

### 문제가 발생할 수 있는 경우

1. **엣지 브라우저 사용자**
   - Windows 사용자 (엣지는 Windows 기본 브라우저)
   - 다른 컴퓨터에서 엣지로 접속 시 같은 문제 발생

2. **사파리 브라우저 사용자**
   - Mac 사용자
   - iOS 사용자 (모바일 Safari)
   - 다른 컴퓨터에서 사파리로 접속 시 같은 문제 발생

3. **엄격한 보안 설정 사용자**
   - 브라우저 보안 설정이 엄격한 경우
   - 기업 환경의 엄격한 정책 적용 시

### 정상 작동할 수 있는 경우

1. **크롬 브라우저 사용자**
   - 대부분의 경우 정상 작동
   - Mixed Content 경고만 발생

2. **파이어폭스 브라우저 사용자**
   - 대부분의 경우 정상 작동
   - 일부 버전에서는 차단 가능

## 테스트 방법

### 다른 컴퓨터에서 테스트

1. **다른 컴퓨터에서 접속**:
   ```
   https://dpt8rhufx9b4x.cloudfront.net/login
   ```

2. **다른 브라우저로 테스트**:
   - 크롬
   - 엣지
   - 파이어폭스
   - 사파리 (Mac 사용 시)

3. **개발자 도구 확인** (`F12`):
   - Console 탭: Mixed Content 오류 확인
   - Network 탭: API 요청 전송 여부 확인

## 해결 방법

### 즉시 해결 (임시)

#### 엣지 브라우저
1. **사이트별 권한 설정**:
   ```
   edge://settings/content/insecureContent
   ```
   - CloudFront URL을 "허용" 목록에 추가

2. **보안 설정 조정**:
   ```
   edge://settings/privacy
   ```
   - "추적 방지" → "기본값" 선택

#### 사파리 브라우저
1. **Safari 설정** → **고급** → **웹 콘텐츠**
2. **"안전하지 않은 콘텐츠 차단"** 해제 (임시)

### 근본적인 해결 (권장)

**API에 HTTPS 추가**가 유일한 근본적인 해결책입니다.

#### 옵션 1: Application Load Balancer (ALB) 사용

1. **ALB 생성** (HTTPS 리스너)
2. **ACM SSL 인증서** 사용
3. **EC2를 타깃 그룹**으로 등록
4. **프론트엔드 API URL** 변경:
   ```javascript
   REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api
   ```

**장점**:
- 모든 브라우저에서 정상 작동 ✅
- 보안 강화 ✅
- 프로덕션 환경에 적합 ✅

**단점**:
- ALB 비용 발생
- 설정 복잡도 증가

#### 옵션 2: Nginx 리버스 프록시

1. **EC2에 Nginx 설치**
2. **Let's Encrypt SSL 인증서** 설정 (무료)
3. **HTTPS 리버스 프록시** 설정
4. **프론트엔드 API URL** 변경:
   ```javascript
   REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api
   ```

**장점**:
- 무료 SSL 인증서 사용 가능 ✅
- 모든 브라우저에서 정상 작동 ✅
- 보안 강화 ✅

**단점**:
- EC2에서 Nginx 관리 필요
- Let's Encrypt 갱신 관리 필요

#### 옵션 3: CloudFront API 프록시

1. **새 CloudFront Distribution** 생성
2. **Origin**: EC2 서버
3. **Custom Domain**: `api.chopplan.kro.kr`
4. **ACM SSL 인증서** 연결
5. **프론트엔드 API URL** 변경:
   ```javascript
   REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api
   ```

**장점**:
- CloudFront 캐싱 활용 가능 ✅
- 모든 브라우저에서 정상 작동 ✅
- DDoS 보호 ✅

**단점**:
- CloudFront 비용 발생
- 설정 복잡도 증가

## 현재 상태 요약

### 정상 작동 ✅
- **크롬**: 대부분 정상 작동 (Mixed Content 경고만 발생)
- **파이어폭스**: 대부분 정상 작동

### 문제 발생 가능 ❌
- **엣지**: Mixed Content 차단 가능
- **사파리**: Mixed Content 차단 가능
- **엄격한 보안 설정 사용자**: 차단 가능

### 영향
- **Windows 사용자 (엣지)**: 문제 발생 가능
- **Mac 사용자 (사파리)**: 문제 발생 가능
- **모바일 사용자 (iOS Safari)**: 문제 발생 가능

## 권장 조치

### 즉시 조치 (임시)
1. **엣지 사용자**: 사이트별 권한 설정 변경 안내
2. **사파리 사용자**: 보안 설정 조정 안내
3. **사용자 교육**: Mixed Content 허용 방법 안내

### 장기 조치 (권장)
1. **API에 HTTPS 추가** (ALB, Nginx, 또는 CloudFront 사용)
2. **프로덕션 환경에서는 반드시 HTTPS 사용**
3. **모든 브라우저에서 정상 작동 보장**

---

**중요**: Mixed Content 문제는 모든 브라우저 사용자에게 영향을 줄 수 있으므로, **API에 HTTPS를 추가하는 것이 유일한 근본적인 해결책**입니다!





