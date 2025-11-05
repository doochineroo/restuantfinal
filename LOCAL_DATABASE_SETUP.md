# 🆓 무료 로컬 데이터베이스 설정 가이드

AWS RDS 과금을 피하기 위해 로컬 MySQL 데이터베이스로 전환하는 방법입니다.

## 📋 변경 사항

✅ `application.properties`가 로컬 MySQL을 기본값으로 사용하도록 변경됨
✅ 프로파일 기반 설정 추가 (로컬/클라우드 전환 가능)

## 🚀 빠른 시작

### 방법 1: XAMPP 사용 (가장 쉬움)

1. **XAMPP 다운로드 및 설치**
   - https://www.apachefriends.org/download.html
   - Windows용 XAMPP 다운로드 및 설치

2. **XAMPP Control Panel 실행**
   - MySQL "Start" 클릭
   - 포트 3306에서 실행 확인

3. **데이터베이스 생성**
   ```sql
   CREATE DATABASE `restaurant-demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **애플리케이션 실행**
   ```bash
   gradlew.bat clean build
   java -jar build\libs\choprest-0.0.1-SNAPSHOT.jar
   ```

### 방법 2: MySQL 직접 설치

1. **MySQL 다운로드**
   - https://dev.mysql.com/downloads/mysql/
   - MySQL Installer for Windows 다운로드

2. **설치 및 설정**
   - 설치 중 "Developer Default" 선택
   - root 비밀번호 설정 (기억해두세요!)

3. **데이터베이스 생성**
   ```sql
   CREATE DATABASE `restaurant-demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **application.properties 수정** (root 비밀번호가 있는 경우)
   ```properties
   spring.datasource.password=your-mysql-root-password
   ```

### 방법 3: 자동 설정 스크립트 사용

```bash
# MySQL이 이미 설치되어 있는 경우
setup-mysql.bat
```

스크립트가 다음을 자동으로 수행합니다:
- MySQL 설치 확인
- 데이터베이스 생성 (`restaurant-demo`)
- 사용자 생성 및 권한 부여

## ⚙️ 설정 파일

### 기본 설정 (로컬)
`src/main/resources/application.properties`
- 로컬 MySQL (`localhost:3306`)을 기본값으로 사용

### 프로파일 사용

**로컬 환경 (기본)**
```bash
java -jar app.jar
# 또는 명시적으로
java -jar app.jar --spring.profiles.active=local
```

**AWS RDS 사용 시**
```bash
java -jar app.jar --spring.profiles.active=aws
```

## 🔧 연결 설정 수정

### 비밀번호가 있는 경우
`src/main/resources/application.properties` 수정:
```properties
spring.datasource.password=your-password
```

### 다른 포트 사용 시
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/restaurant-demo?...
```

### 다른 사용자 사용 시
```properties
spring.datasource.username=your-username
spring.datasource.password=your-password
```

## 🧪 연결 테스트

### MySQL 명령줄로 테스트
```bash
mysql -u root -p
# 비밀번호 입력 후
USE restaurant-demo;
SHOW TABLES;
```

### 애플리케이션 실행 테스트
```bash
gradlew.bat bootRun
```

로그에서 다음 메시지 확인:
```
✅ HikariPool-1 - Start completed
✅ Started ChoprestApplication
```

## 📊 데이터베이스 도구

### DBeaver (추천)
1. https://dbeaver.io/download/ 다운로드
2. 설치 후 새 연결 생성
3. MySQL 선택
4. 연결 정보:
   - Host: `localhost`
   - Port: `3306`
   - Database: `restaurant-demo`
   - Username: `root`
   - Password: (설정한 비밀번호)

### MySQL Workbench
- MySQL 공식 GUI 도구
- https://dev.mysql.com/downloads/workbench/

## 🔄 데이터 마이그레이션 (선택사항)

AWS RDS에서 데이터를 가져와야 하는 경우:

1. **AWS RDS에서 덤프 생성**
   ```bash
   mysqldump -h chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com \
     -u admin -pchopplan123 restaurant-demo > dump.sql
   ```

2. **로컬에 복원**
   ```bash
   mysql -u root -p restaurant-demo < dump.sql
   ```

## ❓ 문제 해결

### "Connection refused" 오류
- MySQL 서비스가 실행 중인지 확인
- XAMPP: Control Panel에서 MySQL Start 확인
- 직접 설치: 서비스 관리자에서 MySQL 서비스 시작

### "Access denied" 오류
- 비밀번호가 맞는지 확인
- `application.properties`의 username/password 확인
- root 사용자 비밀번호 재설정:
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
  ```

### "Unknown database 'restaurant-demo'" 오류
- 데이터베이스가 생성되지 않음
- 위의 "데이터베이스 생성" 단계 실행

### 포트 충돌
- 다른 애플리케이션이 3306 포트 사용 중일 수 있음
- `netstat -ano | findstr :3306` 로 확인
- MySQL 설정 파일에서 포트 변경 또는 다른 애플리케이션 종료

## 💡 팁

1. **H2 인메모리 DB 사용 (임시)**
   - MySQL 설치가 번거로울 때
   - `application-local.properties`에서 H2 설정 주석 해제
   - ⚠️ 서버 재시작 시 데이터 초기화됨

2. **프로파일 자동 선택**
   - 환경변수 `SPRING_PROFILES_ACTIVE=local` 설정
   - IDE 실행 설정에서 프로파일 지정

3. **데이터 백업**
   - 정기적으로 로컬 DB 백업
   - `mysqldump -u root -p restaurant-demo > backup.sql`

## ✅ 완료 확인

다음 명령어로 확인:
```bash
# 백엔드 빌드 및 실행
gradlew.bat clean build
java -jar build\libs\choprest-0.0.1-SNAPSHOT.jar

# 프론트엔드 실행 (다른 터미널)
cd frontend
npm start
```

브라우저에서 `http://localhost:3000` 접속하여 정상 작동 확인!

## 🎯 다음 단계

- [x] 로컬 MySQL 설정
- [x] application.properties 변경
- [ ] AWS 리소스 삭제 (과금 방지)
- [ ] 데이터 마이그레이션 (필요시)

## 📞 추가 도움

문제가 발생하면:
1. 로그 확인: `tail -f logs/application.log`
2. MySQL 서비스 상태 확인
3. 방화벽 설정 확인 (로컬은 보통 문제 없음)





