# 🔧 엣지 브라우저 Mixed Content 문제 해결

## 문제점

**크롬**: 로그인 정상 작동 ✅  
**엣지**: 서버 연결 안 됨 ❌

## 원인

엣지 브라우저가 Mixed Content를 더 엄격하게 차단합니다:
- HTTPS 페이지(`https://dpt8rhufx9b4x.cloudfront.net/`)에서
- HTTP API(`http://ec2-3-37-176-10...`) 호출 시
- **엣지는 Mixed Content를 차단**하는 반면, 크롬은 경고만 보여줍니다

## 즉시 해결 방법

### 방법 1: 엣지 보안 설정 변경 (임시)

1. **엣지 주소창**에 입력:
   ```
   edge://settings/privacy
   ```

2. **"추적 방지"** 설정:
   - "기본값" 선택 (엄격하지 않은 설정)

3. **사이트별 권한 설정**:
   ```
   edge://settings/content/siteDetails?site=dpt8rhufx9b4x.cloudfront.net
   ```
   - "안전하지 않은 콘텐츠" → **"허용"** 선택 (임시)

### 방법 2: 엣지 개발자 도구 확인

1. **개발자 도구** (`F12`) 열기
2. **Console 탭**에서 오류 확인:
   - "Mixed Content" 관련 오류 메시지 확인
   - "CORS" 관련 오류 확인
   - "Network Error" 확인

3. **Network 탭**에서:
   - API 요청이 실제로 전송되는지 확인
   - 요청 상태 확인 (차단됨, 실패, 타임아웃 등)

### 방법 3: 엣지 캐시 완전 삭제

1. **엣지 설정** → **개인 정보, 검색 및 서비스**
2. **"인터넷 사용 기록 삭제"** 클릭
3. **"캐시된 이미지 및 파일"** 선택
4. **"지금 지우기"** 클릭
5. 브라우저 재시작

### 방법 4: 엣지 강제 새로고침

- `Ctrl + Shift + R` 또는 `Ctrl + F5`
- 또는 개발자 도구 (`F12`) → Network 탭 → **"캐시 사용 안 함"** 체크

## 근본적인 해결 방법 (권장)

### API에 HTTPS 추가

엣지의 Mixed Content 차단을 완전히 해결하려면 API에도 HTTPS를 제공해야 합니다.

#### 옵션 1: Application Load Balancer (ALB) 사용

1. **ALB 생성** (HTTPS 리스너)
2. **ACM 인증서** 사용
3. **EC2를 타깃 그룹**으로 등록
4. **프론트엔드 API URL** 변경:
   ```javascript
   REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api
   ```

#### 옵션 2: Nginx 리버스 프록시 (EC2에 설치)

1. **EC2에 Nginx 설치**
2. **Let's Encrypt SSL 인증서** 설정
3. **HTTPS 리버스 프록시** 설정 (8080 포트로 프록시)
4. **프론트엔드 API URL** 변경:
   ```javascript
   REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api
   ```

#### 옵션 3: CloudFront를 API 프록시로 사용

1. **새 CloudFront Distribution** 생성
2. **Origin**: EC2 서버
3. **Custom Domain**: `api.chopplan.kro.kr`
4. **SSL 인증서** 연결
5. **프론트엔드 API URL** 변경:
   ```javascript
   REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api
   ```

## 테스트 방법

### 1. 서버 연결 테스트
```bash
curl http://ec2-3-37-176-10.ap-northeast-2.compute.amazonaws.com:8080/api/restaurants/all
```

### 2. 엣지에서 확인
1. **엣지 개발자 도구** (`F12`) 열기
2. **Console 탭**에서 오류 확인
3. **Network 탭**에서 API 요청 확인
4. **Mixed Content 경고** 확인

### 3. 크롬과 비교
- 크롬: Mixed Content 경고만 발생, 요청 진행됨 ✅
- 엣지: Mixed Content 차단 가능성 높음 ❌

## 현재 상태

- **프론트엔드**: `https://dpt8rhufx9b4x.cloudfront.net/` (HTTPS) ✅
- **API**: `http://ec2-3-37-176-10.ap-northeast-2.compute.amazonaws.com:8080/api` (HTTP) ⚠️
- **Mixed Content**: HTTPS → HTTP 호출 ⚠️

## 권장 조치

### 즉시 조치 (임시)
1. 엣지 보안 설정 변경
2. 엣지 캐시 삭제
3. 엣지 강제 새로고침

### 장기 조치 (권장)
1. **API에 HTTPS 추가** (ALB 또는 Nginx 사용)
2. 프로덕션 환경에서는 반드시 HTTPS 사용

---

**중요**: Mixed Content는 보안 취약점이므로, 프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다!





