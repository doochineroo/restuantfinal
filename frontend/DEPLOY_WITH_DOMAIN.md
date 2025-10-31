# 🚀 도메인 설정 후 배포 가이드

5단계까지 완료하셨다면 이제 프론트엔드 환경변수를 설정하고 배포하면 됩니다!

## 📝 1. 환경변수 파일 생성

`frontend/.env.production` 파일을 생성하고 아래 내용을 실제 도메인으로 변경하세요:

```env
# 프로덕션 환경 변수
# 실제 도메인으로 변경하세요!
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api

# ⚠️ 중요: PUBLIC_URL을 상대 경로(/)로 설정해야 합니다!
# 절대 URL로 설정하면 DNS 해결 문제로 리소스를 로드할 수 없습니다.
PUBLIC_URL=/
```

**예시:**
```env
# 예시: 도메인이 chopplan.kro.kr인 경우
REACT_APP_API_BASE_URL=https://api.chopplan.kro.kr/api
PUBLIC_URL=/
```

## 🔨 2. 프론트엔드 빌드

환경변수 파일을 생성한 후 빌드하세요:

```bash
cd frontend
npm run build
```

**참고:** 
- `build:aws` 스크립트는 CloudFront URL을 하드코딩하고 있습니다
- 도메인을 사용하려면 일반 `build` 명령어를 사용하세요
- 또는 `package.json`의 `build:aws` 스크립트를 업데이트하세요

## ☁️ 3. S3에 업로드

```bash
aws s3 sync build/ s3://chopplandemo-app --delete
```

## 🔄 4. CloudFront 캐시 무효화

```bash
aws cloudfront create-invalidation \
    --distribution-id E285T5MAAKCZRR \
    --paths "/*"
```

## ✅ 5. 확인

1. 브라우저에서 `https://www.yourdomain.com` 접속
2. 개발자 도구(F12) → Network 탭에서 API 요청 확인
3. 모든 API 요청이 `https://api.yourdomain.com/api`로 전송되는지 확인

## 🐛 문제 해결

### API 요청이 여전히 EC2 IP로 가는 경우
- 환경변수가 제대로 설정되었는지 확인
- 브라우저 캐시 삭제
- CloudFront 캐시 무효화 다시 실행

### CORS 오류 발생 시
백엔드 `application.properties`에서 CORS 설정 확인:
```properties
spring.web.cors.allowed-origins=https://www.yourdomain.com
```

