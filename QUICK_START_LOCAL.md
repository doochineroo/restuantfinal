# 🚀 빠른 시작 가이드 (무료 로컬 환경)

AWS 과금 없이 로컬에서 개발하고 실행하는 방법입니다.

## ✅ 변경된 사항

- ✅ 기본 데이터베이스: AWS RDS → 로컬 MySQL
- ✅ 프로파일 설정 추가: 로컬/클라우드 전환 가능
- ✅ 자동 설정 스크립트 추가

## 📦 1단계: 필수 설치

### MySQL 설치 (선택 중 하나)

**옵션 1: XAMPP (가장 쉬움)**
- https://www.apachefriends.org/download.html
- 다운로드 후 설치
- XAMPP Control Panel 실행 → MySQL "Start" 클릭

**옵션 2: MySQL 직접 설치**
- https://dev.mysql.com/downloads/mysql/
- MySQL Installer for Windows 다운로드

### Java 17+ 설치 확인
```bash
java -version
```

### Node.js 설치 확인
```bash
node -v
npm -v
```

## 🗄️ 2단계: 데이터베이스 설정

### 자동 설정 (권장)
```bash
setup-local-database.bat
```

### 수동 설정
1. MySQL 접속:
   ```bash
   mysql -u root -p
   ```

2. 데이터베이스 생성:
   ```sql
   CREATE DATABASE `restaurant-demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. 비밀번호가 있다면 `application.properties` 수정:
   ```properties
   spring.datasource.password=your-password
   ```

## 🏃 3단계: 애플리케이션 실행

### 백엔드 실행
```bash
# 빌드
gradlew.bat clean build

# 실행
java -jar build\libs\choprest-0.0.1-SNAPSHOT.jar

# 또는 개발 모드
gradlew.bat bootRun
```

### 프론트엔드 실행 (새 터미널)
```bash
cd frontend
npm install  # 처음 한 번만
npm start
```

## 🌐 4단계: 접속 확인

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api
- H2 콘솔 (필요시): http://localhost:8080/h2-console

## ⚙️ 설정 파일 위치

- 기본 설정: `src/main/resources/application.properties`
- 로컬 프로파일: `src/main/resources/application-local.properties`
- AWS 프로파일: `src/main/resources/application-aws.properties`

## 🔄 프로파일 사용

**로컬 (기본)**
```bash
java -jar app.jar
```

**AWS RDS 사용**
```bash
java -jar app.jar --spring.profiles.active=aws
```

## ❓ 문제 해결

### "Connection refused"
- MySQL 서비스가 실행 중인지 확인
- XAMPP: Control Panel에서 MySQL 시작
- 포트 3306이 사용 가능한지 확인

### "Access denied"
- `application.properties`의 username/password 확인
- MySQL root 비밀번호 확인

### "Unknown database"
- 데이터베이스가 생성되었는지 확인
- `setup-local-database.bat` 다시 실행

## 📚 자세한 가이드

- [LOCAL_DATABASE_SETUP.md](LOCAL_DATABASE_SETUP.md) - 상세 설정 가이드
- [README.md](README.md) - 전체 프로젝트 문서

## ✅ 체크리스트

- [ ] MySQL 설치 완료
- [ ] 데이터베이스 생성 완료
- [ ] `application.properties` 확인 (비밀번호 필요시)
- [ ] 백엔드 실행 성공
- [ ] 프론트엔드 실행 성공
- [ ] 브라우저에서 접속 확인

## 💡 팁

1. **MySQL 서비스 자동 시작**
   - Windows 서비스에서 MySQL 자동 시작 설정
   - 또는 XAMPP Control Panel에서 시작

2. **데이터 백업**
   ```bash
   mysqldump -u root -p restaurant-demo > backup.sql
   ```

3. **데이터 복원**
   ```bash
   mysql -u root -p restaurant-demo < backup.sql
   ```

## 🎉 완료!

이제 AWS 과금 없이 무료로 개발할 수 있습니다!





