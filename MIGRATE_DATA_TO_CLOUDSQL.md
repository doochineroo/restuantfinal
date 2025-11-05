# 📦 로컬 MySQL → Cloud SQL 데이터 마이그레이션 가이드

## 🚀 빠른 마이그레이션 (자동 스크립트)

### 방법 1: 자동 스크립트 (권장)

```bash
migrate-data-to-cloudsql.bat
```

이 스크립트가 자동으로:
1. 로컬 데이터베이스 확인
2. 덤프 파일 생성
3. Cloud SQL로 데이터 가져오기

## 📋 단계별 방법

### 방법 1: 자동 스크립트 (권장) ✅

```bash
migrate-data-to-cloudsql.bat
```

### 방법 2: DBeaver 사용 (가장 쉬움) ⭐

**1단계: 로컬 MySQL 백업**
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

**2단계: DBeaver로 Cloud SQL 연결**
- DBeaver 실행
- Cloud SQL 연결 (이미 설정했다면)
- SQL 편집기 열기 (`Ctrl+\`)

**3단계: 백업 파일 실행**
- `chopplan_backup.sql` 파일 열기
- 전체 선택 (`Ctrl+A`)
- 실행 (`Ctrl+Enter`)

**완료!** ✅

### 방법 3: MySQL 명령어 직접 사용

**1단계: 덤프 생성**
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

**2단계: Cloud SQL로 가져오기**
```bash
# Public IP 확인
gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)"

# 데이터 가져오기
mysql -h [CLOUD_SQL_IP] -u root -p chopplan < chopplan_backup.sql
```

### 방법 4: Cloud Storage 사용 (대용량 데이터)

**1단계: Cloud Storage 버킷 생성**
```bash
gsutil mb gs://chopplan-backups
```

**2단계: 파일 업로드**
```bash
gsutil cp chopplan_backup.sql gs://chopplan-backups/
```

**3단계: Cloud SQL로 가져오기**
```bash
gcloud sql import sql chopplan-db \
    gs://chopplan-backups/chopplan_backup.sql \
    --database=chopplan
```

## ✅ 데이터 확인

### 마이그레이션 후 확인

```bash
# Cloud SQL에서 데이터 확인
check-cloudsql-data.bat

# 또는 DBeaver로 확인
# - 테이블 목록 확인
# - 데이터 확인
```

### 테이블별 레코드 수 확인

```sql
SELECT 
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'chopplan'
ORDER BY table_rows DESC;
```

## 🔍 문제 해결

### "Connection refused"

**원인:** 네트워크 설정 문제

**해결:**
```bash
fix-cloudsql-connection.bat
```

### "Access denied"

**원인:** 비밀번호가 틀림

**해결:**
- Cloud Console에서 비밀번호 확인
- `application-cloudsql.properties` 확인

### "Unknown database"

**원인:** 데이터베이스가 생성되지 않음

**해결:**
```bash
gcloud sql databases create chopplan --instance=chopplan-db
```

### 파일이 너무 큰 경우

**해결:**
- Cloud Storage 사용
- 또는 DBeaver로 직접 실행

## 📊 예상 소요 시간

| 데이터 크기 | 예상 시간 |
|---|---|
| ~1MB | 1-2분 |
| ~10MB | 5-10분 |
| ~100MB | 10-30분 |

## 💡 팁

### 1. 백업 파일 확인

덤프 파일이 제대로 생성되었는지 확인:
```bash
# 파일 크기 확인
dir chopplan_backup.sql

# 파일 내용 확인 (처음 몇 줄)
head chopplan_backup.sql
```

### 2. 특정 테이블만 가져오기

```bash
# restaurants 테이블만
mysqldump -u root -p1234 chopplan restaurants > restaurants_backup.sql

# 여러 테이블
mysqldump -u root -p1234 chopplan restaurants demo_users > partial_backup.sql
```

### 3. 데이터 확인

마이그레이션 후:
```bash
# 로컬 데이터 개수
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) FROM restaurants;"

# Cloud SQL 데이터 개수
mysql -h [CLOUD_SQL_IP] -u root -p chopplan -e "SELECT COUNT(*) FROM restaurants;"
```

## 🎯 빠른 시작

```bash
# 1. 자동 마이그레이션
migrate-data-to-cloudsql.bat

# 2. 데이터 확인
check-cloudsql-data.bat

# 3. 백엔드 실행
quick-test-local-cloudsql.bat
```

## 📝 체크리스트

- [ ] 로컬 MySQL 데이터 확인
- [ ] 덤프 파일 생성
- [ ] Cloud SQL 연결 확인
- [ ] 데이터 가져오기
- [ ] 데이터 확인

## 🚀 결론

**가장 쉬운 방법:**
```bash
migrate-data-to-cloudsql.bat
```

또는 **DBeaver 사용** (GUI로 더 쉽게!)

