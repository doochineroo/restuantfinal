# 🔌 DBeaver로 Cloud SQL 연결하기

## ✅ 설정 완료 후

`application-cloudsql.properties` 파일을 설정했다면, DBeaver로도 연결할 수 있습니다!

## 🚀 연결 방법

### 1단계: DBeaver 실행

1. **DBeaver 실행**
2. **새 연결 만들기** 클릭 (또는 `Ctrl+Shift+N`)
3. **MySQL** 선택 → **다음**

### 2단계: 연결 정보 입력

**메인 탭:**
```
호스트: [Cloud SQL Public IP]
포트: 3306
데이터베이스: chopplan
사용자명: root
비밀번호: [Cloud SQL 비밀번호]
```

**설정 탭 (선택사항):**
- **보안**: SSL 필요 시 활성화
- **고급**: 필요 시 추가 설정

### 3단계: 연결 테스트

1. **테스트 연결** 클릭
2. ✅ **성공** 메시지 확인
3. **완료** 클릭

## 📋 연결 정보 확인 방법

### 방법 1: application-cloudsql.properties에서 확인

```properties
# 이 부분에서 IP 확인
spring.datasource.url=jdbc:mysql://[이 IP]:3306/chopplan?...
spring.datasource.password=[이 비밀번호]
```

### 방법 2: gcloud CLI로 확인

```bash
# Public IP 확인
gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)"
```

### 방법 3: 자동 스크립트

```bash
# 연결 정보 자동 확인
test-cloudsql-connection.bat
```

## 🔍 연결 정보 예시

```
Host: 104.198.135.103
Port: 3306
Database: chopplan
Username: root
Password: [설정한 비밀번호]
```

## ✅ 연결 확인

연결 성공 후:

1. **왼쪽 트리**에서 `chopplan` 데이터베이스 확인
2. **Tables** 폴더 클릭
3. 테이블 목록 확인 (`restaurants`, `demo_users` 등)

## 🧪 데이터 확인

### 테이블 데이터 보기

1. **테이블 선택** (예: `restaurants`)
2. **우클릭** → **"데이터 읽기"** 또는 **"View Data"**
3. 데이터 확인

### SQL 쿼리 실행

1. **SQL 편집기 열기** (`Ctrl+\`)
2. 쿼리 작성:
   ```sql
   SELECT * FROM restaurants LIMIT 10;
   SELECT COUNT(*) FROM restaurants;
   ```
3. **실행** (`Ctrl+Enter`)

## ❓ 문제 해결

### "Connection refused"

**원인:** Public IP 또는 네트워크 설정 문제

**해결:**
```bash
fix-cloudsql-connection.bat
```

### "Access denied"

**원인:** 비밀번호가 틀림

**해결:**
- 비밀번호 확인
- `application-cloudsql.properties` 확인

### "Unknown database"

**원인:** 데이터베이스가 생성되지 않음

**해결:**
```bash
gcloud sql databases create chopplan --instance=chopplan-db
```

## 💡 팁

### 연결 정보 저장

DBeaver에 연결을 저장하면 나중에 쉽게 접속할 수 있습니다.

### 자동 연결

DBeaver 시작 시 자동으로 연결하려면:
- 연결 설정 → **연결 시 자동 연결** 체크

### 여러 연결 관리

로컬 MySQL과 Cloud SQL을 동시에 연결하여 비교할 수 있습니다:
- 로컬 MySQL: `localhost:3306`
- Cloud SQL: `[Cloud SQL IP]:3306`

## 🎯 빠른 연결

### 연결 정보 빠르게 확인

```bash
# 1. Public IP 확인
gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)"

# 2. 연결 정보 확인
test-cloudsql-connection.bat
```

### DBeaver 연결 설정

1. **새 연결** → **MySQL**
2. **호스트**: 위에서 확인한 Public IP
3. **포트**: 3306
4. **데이터베이스**: chopplan
5. **사용자명**: root
6. **비밀번호**: Cloud SQL 비밀번호
7. **테스트 연결** → **완료**

## 📝 체크리스트

- [ ] Public IP 확인
- [ ] 비밀번호 확인
- [ ] DBeaver에서 새 연결 생성
- [ ] 연결 정보 입력
- [ ] 테스트 연결 성공
- [ ] 데이터 확인

## 🚀 완료!

이제 DBeaver에서 Cloud SQL 데이터를 확인하고 수정할 수 있습니다!

**참고:**
- 백엔드 실행: `quick-test-local-cloudsql.bat`
- DBeaver 연결: 위 방법 사용
- 둘 다 같은 Cloud SQL에 연결됩니다!

