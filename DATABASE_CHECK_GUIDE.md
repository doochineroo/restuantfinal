# 📊 데이터베이스 확인 가이드

로컬 MySQL과 Cloud SQL 모두 확인하는 방법입니다.

## 🚀 빠른 확인 방법

### 방법 1: 자동 스크립트 사용 (로컬 MySQL)

**전체 데이터 확인:**
```bash
check-database-data.bat
```

**레스토랑 데이터 확인:**
```bash
view-restaurants-data.bat
```

**빠른 확인:**
```bash
quick-check-db.bat
```

**특정 테이블 확인:**
```bash
view-table.bat
```

### 방법 2: Cloud SQL 확인

**Cloud SQL 인스턴스 정보 확인:**
```bash
gcloud sql instances describe chopplan-db
```

**Cloud SQL 데이터베이스 목록:**
```bash
gcloud sql databases list --instance=chopplan-db
```

**Cloud SQL 연결 정보 확인:**
```bash
# Public IP 확인
gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)"
```

### 방법 3: MySQL 명령줄 직접 사용

#### 로컬 MySQL
```bash
mysql -u root -p1234 chopplan
```

#### Cloud SQL
```bash
# Public IP로 연결
mysql -h [CLOUD_SQL_IP] -u root -p chopplan
```

## 📋 기본 확인 명령어

### 1. 데이터베이스 목록
```sql
SHOW DATABASES;
```

### 2. 테이블 목록
```sql
SHOW TABLES;
```

### 3. 테이블 구조 확인
```sql
DESCRIBE restaurants;
-- 또는
SHOW COLUMNS FROM restaurants;
```

### 4. 테이블별 레코드 수
```sql
SELECT 
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'chopplan'
ORDER BY table_rows DESC;
```

### 5. restaurants 테이블 통계
```sql
SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
FROM restaurants;
```

### 6. 샘플 데이터 보기
```sql
-- 처음 10개
SELECT id, restaurant_name, branch_name, lat, lng, road_address 
FROM restaurants 
LIMIT 10;

-- 좌표 있는 것만
SELECT id, restaurant_name, branch_name, lat, lng, road_address
FROM restaurants
WHERE lat IS NOT NULL AND lng IS NOT NULL
LIMIT 10;

-- 좌표 없는 것만
SELECT id, restaurant_name, branch_name
FROM restaurants
WHERE lat IS NULL OR lng IS NULL
LIMIT 20;
```

### 7. 특정 레스토랑 검색
```sql
SELECT id, restaurant_name, branch_name, lat, lng
FROM restaurants
WHERE restaurant_name LIKE '%맥도날드%'
LIMIT 10;
```

### 8. 데이터베이스 크기 확인
```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'chopplan'
ORDER BY (data_length + index_length) DESC;
```

## 🖥️ DBeaver 사용 (GUI 도구)

### 로컬 MySQL 연결

1. **DBeaver 실행**
2. **새 연결** → **MySQL** 선택
3. **연결 정보 입력:**
   ```
   Host: localhost
   Port: 3306
   Database: chopplan
   Username: root
   Password: 1234
   ```
4. **테스트 연결** → **완료**

### Cloud SQL 연결

1. **새 연결** → **MySQL** 선택
2. **연결 정보 입력:**
   ```
   Host: [Cloud SQL Public IP]
   Port: 3306
   Database: chopplan
   Username: root
   Password: [Cloud SQL 비밀번호]
   ```
3. **테스트 연결** → **완료**

### 데이터 확인

1. **왼쪽 트리**에서 `chopplan` → `Tables` 클릭
2. **테이블 선택** (예: `restaurants`)
3. **우클릭** → **"데이터 읽기"** 또는 **"View Data"**
4. 또는 **SQL 편집기**에서 쿼리 실행 (`Ctrl+\`)

## 🌐 API로 확인 (백엔드 실행 중일 때)

```bash
# 통계 확인
curl http://localhost:8080/api/restaurants/statistics/coordinates

# 레스토랑 목록
curl http://localhost:8080/api/restaurants

# 특정 레스토랑 검색
curl "http://localhost:8080/api/restaurants?keyword=맥도날드"
```

## 📝 Cloud SQL 전용 확인 스크립트

Cloud SQL을 사용하는 경우를 위한 스크립트를 만들 수 있습니다:

```bash
# Cloud SQL 연결 정보가 application-cloudsql.properties에 설정되어 있다면
# 해당 정보를 읽어서 확인할 수 있습니다
```

## 🔍 문제 해결

### "Connection refused"
- MySQL 서비스가 실행 중인지 확인 (로컬)
- Cloud SQL Public IP가 활성화되었는지 확인
- 네트워크 설정 확인

### "Access denied"
- 비밀번호 확인
- 사용자 권한 확인

### "Unknown database"
- 데이터베이스가 생성되었는지 확인
- 데이터베이스 이름 확인

## 💡 유용한 팁

1. **자주 사용하는 쿼리 저장**
   - DBeaver에서 SQL 스크립트로 저장
   - 나중에 재사용 가능

2. **데이터 내보내기**
   ```bash
   mysqldump -u root -p1234 chopplan restaurants > restaurants_backup.sql
   ```

3. **데이터 가져오기**
   ```bash
   mysql -u root -p1234 chopplan < restaurants_backup.sql
   ```

## 📚 관련 파일

- `check-database-data.bat` - 전체 데이터 확인
- `view-restaurants-data.bat` - 레스토랑 데이터 상세 확인
- `view-table.bat` - 특정 테이블 확인
- `quick-check-db.bat` - 빠른 확인

