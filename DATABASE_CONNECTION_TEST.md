# 🔌 Cloud SQL 데이터베이스 연결 확인 방법

## 🚀 빠른 확인 방법

### 방법 1: 자동 연결 테스트 (권장)

```bash
test-cloudsql-connection.bat
```

이 스크립트는:
1. ✅ 기본 연결 테스트
2. ✅ 데이터베이스 목록 확인
3. ✅ chopplan 데이터베이스 확인
4. ✅ 테이블 목록 확인

### 방법 2: 로컬 애플리케이션 연결 테스트

```bash
test-local-to-cloudsql.bat
```

백엔드 실행하여 Cloud SQL 연결 확인

## 📋 단계별 확인 방법

### 1단계: 기본 연결 테스트

**MySQL 직접 연결:**
```bash
mysql -h [CLOUD_SQL_IP] -u root -p chopplan
```

**비밀번호 입력 후:**
```sql
SELECT 'Connection OK' AS Status;
```

**결과:**
- ✅ `Connection OK` → 연결 성공
- ❌ `Access denied` → 비밀번호 확인
- ❌ `Connection refused` → 네트워크 설정 확인

### 2단계: 데이터베이스 확인

```sql
-- 데이터베이스 목록
SHOW DATABASES;

-- chopplan 데이터베이스 사용
USE chopplan;

-- 테이블 목록
SHOW TABLES;
```

### 3단계: 데이터 확인

```sql
-- 테이블별 레코드 수
SELECT 
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'chopplan'
ORDER BY table_rows DESC;

-- restaurants 테이블 확인
SELECT COUNT(*) FROM restaurants;
SELECT * FROM restaurants LIMIT 5;
```

## 🔍 백엔드 연결 확인

### 방법 1: 백엔드 실행 후 로그 확인

```bash
gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
```

**성공 메시지:**
```
HikariPool-1 - Start completed
Started ChoprestApplication
```

**실패 메시지:**
```
Connection refused
Access denied
Unknown database
```

### 방법 2: 설정 파일 확인

**파일:** `src/main/resources/application-cloudsql.properties`

```properties
spring.datasource.url=jdbc:mysql://[CLOUD_SQL_IP]:3306/chopplan?...
spring.datasource.username=root
spring.datasource.password=[비밀번호]
```

## 🖥️ DBeaver로 연결 확인

### 연결 설정

1. **DBeaver 실행**
2. **새 연결** → **MySQL** 선택
3. **연결 정보 입력:**
   ```
   Host: [Cloud SQL Public IP]
   Port: 3306
   Database: chopplan
   Username: root
   Password: [Cloud SQL 비밀번호]
   ```
4. **테스트 연결** 클릭

**결과:**
- ✅ 연결 성공 → 데이터 확인 가능
- ❌ 연결 실패 → 네트워크/비밀번호 확인

## 📊 연결 상태 확인

### gcloud CLI로 확인

```bash
# 인스턴스 상태
gcloud sql instances describe chopplan-db --format="value(state)"

# Public IP 확인
gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)"
```

### 네트워크 연결 테스트

```bash
# 포트 연결 테스트
telnet [CLOUD_SQL_IP] 3306
```

또는 PowerShell:
```powershell
Test-NetConnection -ComputerName [CLOUD_SQL_IP] -Port 3306
```

## ❓ 문제 해결

### "Connection refused"

**원인:**
- Public IP가 활성화되지 않음
- 승인된 네트워크에 본인 IP가 없음
- 방화벽 규칙 문제

**해결:**
```bash
# Public IP 활성화
gcloud sql instances patch chopplan-db --assign-ip

# 현재 IP 추가
gcloud sql instances patch chopplan-db --authorized-networks=[YOUR_IP]/32
```

### "Access denied"

**원인:**
- 비밀번호가 틀림
- 사용자 권한 문제

**해결:**
- 비밀번호 확인
- `application-cloudsql.properties` 확인

### "Unknown database"

**원인:**
- 데이터베이스가 생성되지 않음

**해결:**
```bash
gcloud sql databases create chopplan --instance=chopplan-db
```

## ✅ 연결 확인 체크리스트

- [ ] Public IP 활성화 확인
- [ ] 승인된 네트워크에 본인 IP 추가
- [ ] 비밀번호 확인
- [ ] 데이터베이스 생성 확인
- [ ] MySQL 직접 연결 테스트
- [ ] DBeaver 연결 테스트
- [ ] 백엔드 실행 후 로그 확인

## 🎯 빠른 확인 명령어

```bash
# 연결 테스트
test-cloudsql-connection.bat

# 백엔드 연결 테스트
test-local-to-cloudsql.bat

# 또는 직접
mysql -h [CLOUD_SQL_IP] -u root -p chopplan
```

## 💡 팁

### 연결 정보 저장

DBeaver에 연결을 저장하면 나중에 쉽게 확인할 수 있습니다.

### 자동 확인 스크립트

```bash
# 매일 연결 상태 확인
test-cloudsql-connection.bat
```

### 백엔드 로그 확인

백엔드 실행 시 로그에서 연결 상태를 확인할 수 있습니다:
- ✅ `HikariPool-1 - Start completed` → 성공
- ❌ `Connection refused` → 실패

