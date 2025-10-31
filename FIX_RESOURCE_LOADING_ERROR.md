# 🔧 ERR_NAME_NOT_RESOLVED 리소스 로딩 오류 해결하기

## ❌ 문제

`www.chopplan.kro.kr`에 접속했을 때:
- HTML은 로드되지만 CSS, JS 파일들이 로드되지 않음
- 에러: `Failed to load resource: net::ERR_NAME_NOT_RESOLVED`
- 예: `main.40066a95.css`, `main.771b5d99.js`, `manifest.json` 로드 실패

## 🔍 원인

현재 빌드된 `index.html` 파일이 모든 리소스를 **절대 URL**로 참조하고 있습니다:
```html
<script src="https://www.chopplan.kro.kr/static/js/main.771b5d99.js"></script>
<link href="https://www.chopplan.kro.kr/static/css/main.40066a95.css" rel="stylesheet">
```

DNS가 해결되지 않으면 브라우저가 리소스를 찾을 수 없습니다.

## ✅ 해결 방법

### 1단계: .env.production 파일 생성

`frontend/.env.production` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 프로덕션 환경 변수
# 도메인: chopplan.kro.kr

# API URL
REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api

# ⚠️ 중요: PUBLIC_URL을 상대 경로(/)로 설정!
# 절대 URL로 설정하면 DNS 해결 문제로 리소스를 로드할 수 없습니다.
PUBLIC_URL=/
```

**중요:** `PUBLIC_URL`을 `/`로 설정하면 리소스가 상대 경로로 빌드됩니다:
- ✅ 상대 경로: `/static/js/main.js` → 현재 도메인으로 자동 해결
- ❌ 절대 URL: `https://www.chopplan.kro.kr/static/js/main.js` → DNS 해결 필요

### 2단계: 프론트엔드 재빌드

```bash
cd frontend
npm run build
```

빌드 후 `frontend/build/index.html` 파일을 확인하면 상대 경로로 변경되어 있어야 합니다:
```html
<script src="/static/js/main.771b5d99.js"></script>
<link href="/static/css/main.40066a95.css" rel="stylesheet">
```

### 3단계: S3에 업로드

```bash
aws s3 sync frontend/build/ s3://chopplandemo-app --delete
```

### 4단계: CloudFront 캐시 무효화

```bash
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
```

## 🚀 자동 배포 스크립트 사용

또는 배포 스크립트를 사용하세요:

**Windows:**
```bash
deploy-with-domain.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-with-domain.sh
./deploy-with-domain.sh
```

## ✅ 확인

1. 빌드된 `index.html` 확인:
   - 상대 경로(`/static/...`)로 되어 있는지 확인
   - 절대 URL(`https://www.chopplan.kro.kr/static/...`)이 아닌지 확인

2. 브라우저에서 테스트:
   - `https://www.chopplan.kro.kr` 접속
   - 개발자 도구(F12) → Network 탭에서 리소스 로드 확인
   - 모든 리소스가 성공적으로 로드되어야 함

## 🔄 대안: CloudFront URL 사용

만약 DNS 전파가 완료되지 않았다면, 임시로 CloudFront URL로 빌드할 수도 있습니다:

```env
PUBLIC_URL=https://dpt8rhufx9b4x.cloudfront.net
```

하지만 **권장 방법은 상대 경로(`/`) 사용**입니다. 그러면 어떤 도메인으로 접속해도 작동합니다.

## 📋 체크리스트

- [ ] `frontend/.env.production` 파일 생성
- [ ] `PUBLIC_URL=/` 설정 확인
- [ ] 프론트엔드 재빌드 완료
- [ ] `index.html`에서 상대 경로 확인
- [ ] S3 업로드 완료
- [ ] CloudFront 캐시 무효화 완료
- [ ] 브라우저에서 리소스 로드 확인

## 💡 참고

- `PUBLIC_URL` 환경변수는 React Create App에서 정적 리소스 경로를 설정하는 데 사용됩니다
- 상대 경로(`/`)를 사용하면 현재 요청의 도메인을 자동으로 사용합니다
- 절대 URL을 사용하면 해당 도메인을 DNS로 해결해야 합니다

