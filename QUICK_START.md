# 🚀 빠른 시작 가이드

## ✅ 단계별 해결

### 1단계: MySQL 비밀번호 확인/설정

**가장 빠른 방법:**

#### 옵션 A: MySQL 접속해서 비밀번호 확인
```bash
mysql -u root -p
```
일반적인 비밀번호 시도: `chopplan123`, `chopplan12`, `password`, `root`, `1234`

접속 성공하면:
```sql
EXIT;
```
그 비밀번호를 `application.properties`에 입력하세요.

#### 옵션 B: 비밀번호 제거 (개발 환경, 가장 간단)
```bash
mysql -u root -p
# 비밀번호 입력 후

ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;
```

그러면 `application.properties`는 그대로 두면 됩니다:
```properties
spring.datasource.password=
```

### 2단계: application.properties 수정 (비밀번호가 있는 경우)

`src/main/resources/application.properties` 파일 열기:

```properties
# 13번째 줄 근처
spring.datasource.password=여기에비밀번호입력
```

예시:
```properties
spring.datasource.password=chopplan123
```

### 3단계: 데이터베이스 생성 (아직 안 했다면)

```bash
mysql -u root -p
# 또는 비밀번호 없으면: mysql -u root

CREATE DATABASE IF NOT EXISTS `restaurant-demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4단계: 백엔드 실행

```bash
gradlew.bat bootRun
```

## 📝 체크리스트

- [ ] MySQL 실행 중 확인 (XAMPP Control Panel 또는 서비스 관리자)
- [ ] MySQL 비밀번호 확인 또는 제거
- [ ] `application.properties`에 비밀번호 설정 (비밀번호가 있다면)
- [ ] 데이터베이스 `restaurant-demo` 생성
- [ ] 백엔드 실행 테스트

## ❓ 문제 해결

### MySQL에 접속이 안 되나요?
- XAMPP 사용: Control Panel에서 MySQL "Start" 확인
- MySQL 직접 설치: 서비스 관리자에서 MySQL 서비스 시작

### 여전히 비밀번호 오류?
1. MySQL 비밀번호 제거 (개발 환경에서 가장 쉬움)
2. 또는 `check-mysql-password.bat` 실행하여 자동 확인





