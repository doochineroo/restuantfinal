# 🔧 로컬 개발 환경 설정 가이드

## 📝 환경변수 파일 구조

React Create App은 환경에 따라 자동으로 다른 환경변수 파일을 로드합니다:

### 1. `.env.development` (개발 모드)
- `npm start` 실행 시 자동으로 로드됨
- 로컬 개발용 설정

### 2. `.env.production` (프로덕션 빌드)
- `npm run build` 실행 시 자동으로 로드됨
- 배포용 설정

### 3. `.env.local` (로컬 오버라이드)
- 모든 환경에서 최우선으로 로드됨
- `.gitignore`에 포함되어 커밋되지 않음
- 개인별 설정이 필요한 경우 사용

---

## 🚀 로컬 개발 시작하기

### 1. 환경변수 파일 확인

**`.env.development`** 파일이 있어야 합니다:
```env
# 개발 환경 변수 (npm start 실행 시 사용)
REACT_APP_API_BASE_URL=http://localhost:8080/api
PUBLIC_URL=/
```

### 2. 백엔드 서버 실행

로컬에서 Spring Boot 백엔드 서버를 실행하세요:
```bash
cd ..
./gradlew bootRun
# 또는
./gradlew.bat bootRun  # Windows
```

백엔드 서버가 `http://localhost:8080`에서 실행되어야 합니다.

### 3. 프론트엔드 개발 서버 실행

```bash
cd frontend
npm start
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

---

## 📋 환경별 설정 요약

### 개발 환경 (npm start)
- **파일**: `.env.development`
- **API URL**: `http://localhost:8080/api`
- **PUBLIC_URL**: `/`

### 프로덕션 환경 (npm run build)
- **파일**: `.env.production`
- **API URL**: `http://api.chopplan.kro.kr:8080/api`
- **PUBLIC_URL**: `/`

---

## 🔄 로컬에서 AWS 서버 사용하기

로컬에서 개발하지만 AWS 서버를 사용하고 싶다면 `.env.development` 파일을 수정하세요:

```env
REACT_APP_API_BASE_URL=http://api.chopplan.kro.kr:8080/api
PUBLIC_URL=/
```

또는 EC2 IP를 직접 사용:
```env
REACT_APP_API_BASE_URL=http://52.78.137.215:8080/api
PUBLIC_URL=/
```

---

## 🛠️ 문제 해결

### API 요청이 실패하는 경우

1. **백엔드 서버 확인**
   - `http://localhost:8080/api/restaurants/all` 접속 테스트
   - 서버가 실행 중인지 확인

2. **CORS 설정 확인**
   - 백엔드 `application.properties`에서 `spring.web.cors.allowed-origins` 확인
   - `http://localhost:3000`이 허용되어 있어야 함

3. **포트 확인**
   - 프론트엔드: 3000
   - 백엔드: 8080
   - 포트 충돌 확인

### 환경변수가 적용되지 않는 경우

1. **파일 이름 확인**
   - `.env.development` (개발 모드)
   - `.env.production` (프로덕션 빌드)
   - 대소문자 구분 확인

2. **서버 재시작**
   - 환경변수 파일 수정 후 `npm start` 재실행 필요

3. **환경변수 형식 확인**
   - `REACT_APP_` 접두사 필수
   - 공백이나 따옴표 없이 설정

---

## ✅ 체크리스트

- [ ] `.env.development` 파일 생성됨
- [ ] 백엔드 서버 실행 중 (`localhost:8080`)
- [ ] 프론트엔드 개발 서버 실행 중 (`localhost:3000`)
- [ ] API 요청이 정상적으로 작동함
- [ ] CORS 설정 확인됨

---

## 📚 참고

- React 환경변수: https://create-react-app.dev/docs/adding-custom-environment-variables/
- 환경변수는 빌드 시점에 포함되므로, 수정 후 서버 재시작 필요

