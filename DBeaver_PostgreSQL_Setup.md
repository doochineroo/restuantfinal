# DBeaver로 PostgreSQL 연결하기

## 🐘 PostgreSQL 설치 및 설정

### 1. PostgreSQL 설치 (Windows)
```bash
# Chocolatey 사용 (관리자 권한으로 실행)
choco install postgresql

# 또는 공식 사이트에서 다운로드
# https://www.postgresql.org/download/windows/
```

### 2. PostgreSQL 서비스 시작
```bash
# 서비스 시작
net start postgresql-x64-15

# 또는 Windows 서비스에서 "postgresql" 시작
```

### 3. 데이터베이스 생성
```sql
-- PostgreSQL에 접속 (psql 또는 pgAdmin 사용)
-- 기본 사용자: postgres

-- 데이터베이스 생성
CREATE DATABASE choprest;

-- 사용자 생성
CREATE USER choprest WITH PASSWORD 'password123';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE choprest TO choprest;
```

### 4. DBeaver 연결 설정
1. **새 연결 생성**: `Database` → `New Database Connection`
2. **PostgreSQL 선택**
3. **연결 정보 입력**:
   ```
   Host: localhost
   Port: 5432
   Database: choprest
   Username: choprest
   Password: password123
   ```
4. **Test Connection** → **Finish**

### 5. Spring Boot 설정 변경
`src/main/resources/application.properties` 수정:
```properties
# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/choprest
spring.datasource.username=choprest
spring.datasource.password=password123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console 비활성화
spring.h2.console.enabled=false
```

### 6. PostgreSQL 드라이버 의존성 추가
`build.gradle`에 추가:
```gradle
dependencies {
    // 기존 의존성들...
    runtimeOnly 'org.postgresql:postgresql'
}
```

### 7. 애플리케이션 실행 및 테스트
```bash
# 의존성 다운로드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun
```

### 8. DBeaver에서 데이터 확인
- 연결 후 `restaurant` 테이블 확인
- 데이터 조회, 수정, 삭제 가능
- ERD 생성 가능

## 🎯 장점
- ✅ **영구 저장**: 애플리케이션 재시작해도 데이터 유지
- ✅ **확장성**: 대용량 데이터 처리 가능
- ✅ **표준 SQL**: 표준 SQL 문법 사용
- ✅ **DBeaver 완벽 지원**: 모든 기능 사용 가능

