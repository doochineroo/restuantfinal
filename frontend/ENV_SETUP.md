# 🔧 환경변수 설정 가이드

## ✅ 6단계: 프론트엔드 환경변수 설정

도메인 `chopplan.kro.kr`로 환경변수 파일을 생성하세요.

### 1. 파일 생성

`frontend/.env.production` 파일을 생성하고 아래 내용을 입력하세요:

```env
# 프로덕션 환경 변수
# 도메인: chopplan.kro.kr
REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api

# ⚠️ 중요: PUBLIC_URL을 상대 경로(/)로 설정해야 합니다!
# 절대 URL로 설정하면 DNS 해결 문제로 리소스를 로드할 수 없습니다.
PUBLIC_URL=/
```

### 2. 파일 위치 확인

파일 위치: `frontend/.env.production`

### 3. 빌드 및 배포

환경변수 파일을 생성한 후:

**Windows:**
```bash
deploy-with-domain.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-with-domain.sh
./deploy-with-domain.sh
```

또는 수동 배포:
```bash
cd frontend
npm run build
aws s3 sync build/ s3://chopplandemo-app --delete
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
```

### 4. 확인

배포 후 브라우저에서 접속:
- Frontend: https://www.chopplan.kro.kr
- API 요청: https://api.chopplan.kro.kr/api

개발자 도구(F12) → Network 탭에서 API 요청이 올바른 도메인으로 가는지 확인하세요!

