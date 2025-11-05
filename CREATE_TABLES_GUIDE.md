# 📊 Cloud SQL 테이블 생성 가이드

## 🚀 자동 생성 방법 (권장)

### 방법 1: 자동 스크립트 사용

```bash
create-tables-cloudsql.bat
```

이 스크립트는:
1. 백엔드를 빌드
2. Cloud SQL 프로파일로 실행
3. 엔티티 클래스에서 자동으로 테이블 생성

### 방법 2: 수동 실행

```bash
# 빌드
gradlew.bat clean build

# Cloud SQL 프로파일로 실행
gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
```

## 📋 설정 확인

### application-cloudsql.properties

다음 설정이 있어야 테이블이 자동 생성됩니다:

```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

이 설정으로:
- ✅ 엔티티 클래스에서 자동으로 테이블 생성
- ✅ 테이블이 없으면 생성
- ✅ 컬럼이 변경되면 업데이트

## 📊 생성될 테이블 목록

### 주요 테이블

1. **restaurants** - 식당 정보
2. **demo_users** - 사용자 정보
3. **demo_reservations** - 예약 정보
4. **demo_blacklist** - 블랙리스트
5. **EVENTS** - 이벤트 정보
6. **menus** - 메뉴 정보
7. **notifications** - 알림 정보
8. **search_keywords** - 검색 키워드
9. **user_favorites** - 즐겨찾기
10. **additional_info** - 추가 정보
11. **restaurant_clicks** - 클릭 통계
12. **demo_chat_rooms** - 채팅방
13. **demo_chat_messages** - 채팅 메시지
14. **demo_reviews** - 리뷰

## ✅ 테이블 생성 확인

### 방법 1: DBeaver로 확인

1. DBeaver 연결
2. `chopplan` 데이터베이스 선택
3. **Tables** 폴더 확인
4. 테이블 목록 확인

### 방법 2: MySQL 명령어

```bash
mysql -h [CLOUD_SQL_IP] -u root -p chopplan

# 테이블 목록 확인
SHOW TABLES;

# 특정 테이블 구조 확인
DESCRIBE restaurants;
```

### 방법 3: 스크립트로 확인

```bash
check-cloudsql-data.bat
```

## 🔍 생성 과정 확인

### 백엔드 실행 시 로그 확인

백엔드를 실행하면 다음 로그가 표시됩니다:

```
Hibernate: create table restaurants (...)
Hibernate: create table demo_users (...)
...
HikariPool-1 - Start completed
Started ChoprestApplication
```

### 에러 발생 시

- **"Table already exists"**: 테이블이 이미 존재함 (정상)
- **"Connection refused"**: 연결 문제 확인
- **"Access denied"**: 비밀번호/권한 확인

## ⚙️ ddl-auto 설정 옵션

### update (권장)
```properties
spring.jpa.hibernate.ddl-auto=update
```
- 테이블이 없으면 생성
- 컬럼 추가/변경 시 업데이트
- 기존 데이터 유지

### create
```properties
spring.jpa.hibernate.ddl-auto=create
```
- 항상 테이블을 새로 생성
- 기존 데이터 삭제됨 (주의!)

### validate
```properties
spring.jpa.hibernate.ddl-auto=validate
```
- 테이블 구조만 확인
- 자동 생성 안 함

### none
```properties
spring.jpa.hibernate.ddl-auto=none
```
- 자동 생성 비활성화
- 수동으로 테이블 생성 필요

## 🚀 빠른 시작

### 1단계: 설정 확인

`application-cloudsql.properties`에 다음이 있는지 확인:
```properties
spring.jpa.hibernate.ddl-auto=update
```

### 2단계: 테이블 생성

```bash
create-tables-cloudsql.bat
```

### 3단계: 확인

```bash
# DBeaver로 확인
# 또는
check-cloudsql-data.bat
```

## 💡 팁

### 테이블 재생성

테이블을 처음부터 다시 만들려면:
1. DBeaver에서 테이블 삭제
2. 백엔드 다시 실행

또는:
```properties
# 임시로 create로 변경
spring.jpa.hibernate.ddl-auto=create
```

### 테이블 구조 확인

```sql
-- 테이블 목록
SHOW TABLES;

-- 테이블 구조
DESCRIBE restaurants;

-- 테이블 생성 SQL 확인
SHOW CREATE TABLE restaurants;
```

## 📝 체크리스트

- [ ] `application-cloudsql.properties` 설정 확인
- [ ] `ddl-auto=update` 설정 확인
- [ ] 백엔드 실행
- [ ] 테이블 생성 확인
- [ ] DBeaver로 테이블 목록 확인

## 🎯 결론

**가장 쉬운 방법:**
```bash
create-tables-cloudsql.bat
```

이 스크립트를 실행하면 모든 테이블이 자동으로 생성됩니다!

