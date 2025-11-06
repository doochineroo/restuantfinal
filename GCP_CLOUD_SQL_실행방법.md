# ☁️ GCP Cloud SQL 실행 방법

## ⚠️ 중요: 프로파일 지정 필요!

Cloud SQL을 사용하려면 **반드시 프로파일을 지정**해야 합니다.

### ❌ 잘못된 방법 (로컬 MySQL 사용)
```bash
gradlew.bat bootRun
```
→ 이렇게 하면 기본 `application.properties`를 사용해서 **로컬 MySQL**에 연결됩니다.

### ✅ 올바른 방법 (Cloud SQL 사용)

#### 방법 1: 스크립트 사용 (권장)
```bash
quick-test-local-cloudsql.bat
```

#### 방법 2: 수동 실행
```bash
# 빌드
gradlew.bat clean build

# Cloud SQL 프로파일로 실행
gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
```

또는 JAR 파일로 실행:
```bash
java -jar build\libs\choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=cloudsql
```

---

## 📋 실행 전 확인사항

### 1. Cloud SQL 설정 확인
`src/main/resources/application-cloudsql.properties` 파일 확인:

```properties
# Cloud SQL IP 주소 확인
spring.datasource.url=jdbc:mysql://[Cloud SQL IP]:3306/chopplan?...
# 예: jdbc:mysql://104.198.135.103:3306/chopplan?useSSL=true&...

# 비밀번호 확인
spring.datasource.password=chopplan123
```

### 2. Cloud SQL 인스턴스 상태 확인
- Google Cloud Console에서 Cloud SQL 인스턴스가 실행 중인지 확인
- Public IP가 활성화되어 있는지 확인
- 승인된 네트워크에 본인 IP가 추가되어 있는지 확인

### 3. 데이터베이스 생성 확인
- Cloud SQL에 `chopplan` 데이터베이스가 생성되어 있는지 확인

---

## 🔄 프로파일별 실행 방법

| 프로파일 | 실행 명령 | 사용 DB |
|---------|----------|---------|
| **기본 (로컬)** | `gradlew.bat bootRun` | 로컬 MySQL |
| **Cloud SQL** | `gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'` | Cloud SQL |
| **GCP VM** | `gradlew.bat bootRun --args='--spring.profiles.active=gcp'` | VM 내부 MySQL |

---

## 🧪 연결 테스트

### 백엔드 실행 후 확인
```bash
# API 테스트
curl http://localhost:8080/api/restaurants
```

또는 브라우저에서:
- http://localhost:8080/api/restaurants

### 프론트엔드 실행 (새 터미널)
```bash
cd frontend
npm start
```

---

## ❓ 문제 해결

### "Connection refused"
- Cloud SQL 인스턴스가 실행 중인지 확인
- Public IP가 활성화되어 있는지 확인
- 승인된 네트워크에 본인 IP가 추가되어 있는지 확인

### "Access denied"
- `application-cloudsql.properties`의 비밀번호 확인
- Cloud SQL root 비밀번호 확인

### "Unknown database 'chopplan'"
- Cloud SQL에 `chopplan` 데이터베이스가 생성되었는지 확인
- 데이터 마이그레이션 필요할 수 있음

### 여전히 로컬 MySQL에 연결되는 경우
- 프로파일이 제대로 지정되었는지 확인
- `--spring.profiles.active=cloudsql` 확인
- 콘솔 로그에서 어떤 프로파일이 로드되는지 확인

---

## 📝 요약

**Cloud SQL 사용 시:**
1. ✅ `application-cloudsql.properties` 설정 확인
2. ✅ 프로파일 지정: `--spring.profiles.active=cloudsql`
3. ✅ Cloud SQL 인스턴스 실행 중 확인
4. ✅ 네트워크 설정 확인 (Public IP, 승인된 네트워크)

**단순히 `bootRun`만 하면:**
- ❌ 로컬 MySQL에 연결됨 (기본 `application.properties` 사용)

