# ⚙️ application.properties 설정 가이드

## 📋 현재 상황

### `application.properties` (기본)
- **현재 설정**: 로컬 MySQL (`localhost:3306`)
- **사용 시기**: 로컬 개발 시

### `application-cloudsql.properties` (Cloud SQL)
- **설정**: Cloud SQL 연결
- **사용 시기**: Cloud SQL 사용 시 (프로파일 활성화 필요)

## 🔄 변경 방법

### 방법 1: 프로파일 사용 (권장) ✅

**`application.properties`는 변경하지 않습니다!**

대신 `application-cloudsql.properties` 파일을 수정하고 프로파일을 활성화합니다.

**1단계: `application-cloudsql.properties` 수정**
```properties
# Cloud SQL Public IP로 변경
spring.datasource.url=jdbc:mysql://[YOUR_CLOUD_SQL_IP]:3306/chopplan?...
spring.datasource.password=[YOUR_CLOUD_SQL_PASSWORD]
```

**2단계: 프로파일로 실행**
```bash
gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
```

**장점:**
- ✅ 로컬/Cloud SQL 전환 쉬움
- ✅ `application.properties` 유지
- ✅ 다른 개발자와 충돌 없음

### 방법 2: `application.properties` 직접 수정

**`application.properties`를 직접 수정:**

```properties
# 기존 (로컬 MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/chopplan?...

# 변경 (Cloud SQL)
spring.datasource.url=jdbc:mysql://[CLOUD_SQL_IP]:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.password=[CLOUD_SQL_PASSWORD]
```

**단점:**
- ❌ 로컬/Cloud SQL 전환 시 수동 변경 필요
- ❌ 다른 개발자와 충돌 가능

## 💡 권장 방법

### 프로파일 사용 (방법 1)

**변경할 파일:**
- ❌ `application.properties` → 변경 안 함
- ✅ `application-cloudsql.properties` → Public IP와 비밀번호 설정

**실행:**
```bash
# Cloud SQL 사용
quick-test-local-cloudsql.bat

# 또는 직접
gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
```

## 📝 설정 파일 비교

### `application.properties` (현재)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/chopplan?...
spring.datasource.password=1234
```

### `application-cloudsql.properties` (수정 필요)
```properties
spring.datasource.url=jdbc:mysql://[CLOUD_SQL_IP]:3306/chopplan?...
spring.datasource.password=[CLOUD_SQL_PASSWORD]
```

## ✅ 체크리스트

### 프로파일 사용 시 (권장)

- [ ] `application.properties` 변경 안 함
- [ ] `application-cloudsql.properties`에서 Public IP 설정
- [ ] `application-cloudsql.properties`에서 비밀번호 설정
- [ ] 프로파일로 실행 (`--spring.profiles.active=cloudsql`)

### 직접 수정 시

- [ ] `application.properties`에서 `localhost` → `[CLOUD_SQL_IP]` 변경
- [ ] `application.properties`에서 비밀번호 변경
- [ ] `useSSL=true` 추가 확인

## 🎯 결론

**권장: `application.properties`는 변경하지 않고 프로파일 사용!**

1. `application-cloudsql.properties` 파일만 수정
2. Public IP와 비밀번호 설정
3. 프로파일로 실행

**이렇게 하면:**
- ✅ 로컬 개발 시: 기본 설정 사용
- ✅ Cloud SQL 사용 시: 프로파일 활성화
- ✅ 전환 쉬움

