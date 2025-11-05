# 🧪 로컬 테스트 가이드

로컬에서 테스트하고 나중에 GCP에 배포하는 방법입니다.

## 📋 사전 준비

### 1. 필수 설치 확인
- ✅ Java 17+ (`java -version`)
- ✅ Node.js (`node -v`, `npm -v`)
- ✅ MySQL (XAMPP 또는 직접 설치)

### 2. 데이터베이스 설정

**자동 설정 (권장)**
```bash
setup-local-database.bat
```

**수동 설정**
1. MySQL 서비스 시작 (XAMPP Control Panel 또는 서비스 관리자)
2. 데이터베이스 생성:
   ```sql
   CREATE DATABASE `chopplan` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. `src/main/resources/application.properties` 확인:
   - 데이터베이스 이름: `chopplan`
   - 비밀번호: `1234` (필요시 수정)

## 🚀 로컬 테스트 실행

### 방법 1: 통합 스크립트 사용 (권장)

**백엔드 실행:**
```bash
quick-test-local.bat
```

이 스크립트는:
1. 백엔드를 빌드하고 실행합니다
2. 포트 8080에서 백엔드 서버가 시작됩니다
3. 새 터미널에서 프론트엔드를 실행하라고 안내합니다

**프론트엔드 실행 (새 터미널):**
```bash
cd frontend
npm start
# 또는
frontend\START_FRONTEND.bat
```

### 방법 2: 개별 실행

**백엔드:**
```bash
# 빌드
gradlew.bat clean build

# 실행
gradlew.bat bootRun
# 또는
java -jar build\libs\choprest-0.0.1-SNAPSHOT.jar
```

**프론트엔드 (새 터미널):**
```bash
cd frontend
npm install  # 처음 한 번만
npm start
```

## 🌐 접속 확인

- **백엔드 API**: http://localhost:8080/api
- **프론트엔드**: http://localhost:3000
- **API 테스트**: http://localhost:8080/api/restaurants

## ⚙️ 설정 확인

### application.properties
로컬 테스트 시 다음 설정이 자동으로 사용됩니다:
- 데이터베이스: `localhost:3306/chopplan`
- 서버 포트: `8080`
- 프론트엔드 API URL: `http://localhost:8080/api` (자동)

### 프론트엔드 설정
프론트엔드는 개발 모드에서 자동으로 `http://localhost:8080/api`를 사용합니다.
별도 설정 불필요!

## 🔄 GCP 배포 준비

로컬 테스트가 완료되면 GCP에 배포할 수 있습니다:

```bash
quick-deploy.bat
```

이 스크립트는:
1. 백엔드와 프론트엔드를 빌드
2. GCP VM에 파일 업로드
3. 애플리케이션 재시작

## ❓ 문제 해결

### "Connection refused"
- MySQL 서비스가 실행 중인지 확인
- XAMPP: Control Panel에서 MySQL 시작
- 포트 3306이 사용 가능한지 확인

### "Access denied"
- `application.properties`의 비밀번호 확인
- MySQL root 비밀번호 확인

### "Unknown database 'chopplan'"
- 데이터베이스가 생성되었는지 확인
- `setup-local-database.bat` 실행 (데이터베이스 이름 확인 필요)

### 포트 충돌
- 8080 포트: 다른 Java 애플리케이션이 실행 중일 수 있음
- 3000 포트: 다른 React 앱이 실행 중일 수 있음

## ✅ 체크리스트

- [ ] MySQL 설치 및 실행 확인
- [ ] 데이터베이스 `chopplan` 생성 확인
- [ ] `application.properties` 비밀번호 확인
- [ ] 백엔드 실행 성공 (포트 8080)
- [ ] 프론트엔드 실행 성공 (포트 3000)
- [ ] 브라우저에서 접속 확인

## 💡 팁

1. **두 터미널 사용**
   - 터미널 1: 백엔드 실행 (`quick-test-local.bat`)
   - 터미널 2: 프론트엔드 실행 (`cd frontend && npm start`)

2. **데이터베이스 확인**
   ```bash
   mysql -u root -p
   USE chopplan;
   SHOW TABLES;
   ```

3. **API 테스트**
   ```bash
   curl http://localhost:8080/api/restaurants
   ```

## 🎯 다음 단계

로컬 테스트 완료 후:
1. GCP 배포: `quick-deploy.bat`
2. 또는 수동 배포: [GCP_COMPLETE_DEPLOYMENT_GUIDE.md](GCP_COMPLETE_DEPLOYMENT_GUIDE.md) 참고

