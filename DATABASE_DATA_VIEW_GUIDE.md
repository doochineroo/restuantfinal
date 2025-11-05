# 📊 데이터베이스 데이터 확인 가이드

## 🚀 빠른 확인 방법

### 방법 1: 자동 스크립트 사용

```bash
# 전체 데이터베이스 정보 확인
./check-database-data.bat

# restaurants 테이블 상세 확인
./view-restaurants-data.bat
```

### 방법 2: MySQL 명령줄 직접 사용

```bash
mysql -u root -p1234 chopplan
```

#### 기본 확인 명령어

```sql
-- 모든 테이블 목록
SHOW TABLES;

-- 테이블별 레코드 수
SELECT 
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = 'chopplan';

-- restaurants 테이블 전체 개수
SELECT COUNT(*) FROM restaurants;

-- 좌표 통계
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
FROM restaurants;

-- 샘플 데이터 보기 (10개)
SELECT id, restaurant_name, branch_name, lat, lng, road_address 
FROM restaurants 
LIMIT 10;

-- 좌표 없는 레스토랑 확인
SELECT id, restaurant_name, branch_name 
FROM restaurants 
WHERE lat IS NULL OR lng IS NULL 
LIMIT 20;

-- 좌표 있는 레스토랑 확인
SELECT id, restaurant_name, branch_name, lat, lng, road_address 
FROM restaurants 
WHERE lat IS NOT NULL AND lng IS NOT NULL 
LIMIT 20;
```

### 방법 3: DBeaver 사용 (GUI 도구)

1. **DBeaver 실행**
2. **연결 설정:**
   ```
   Host: localhost
   Port: 3306
   Database: chopplan
   Username: root
   Password: 1234
   ```
3. **데이터 확인:**
   - 왼쪽 트리에서 `chopplan` → `Tables` 클릭
   - 테이블 선택 후 우클릭 → "View Data" 또는 "Read Data in SQL Editor"
   - SQL 편집기에서 쿼리 실행

### 방법 4: API로 확인 (백엔드 실행 중일 때)

```bash
# 좌표 통계
curl http://localhost:8080/api/restaurants/statistics/coordinates

# 모든 레스토랑 목록 (최대 100개)
curl http://localhost:8080/api/restaurants/all | head -c 500
```

## 📋 주요 테이블 확인

### restaurants 테이블

```sql
-- 전체 개수
SELECT COUNT(*) FROM restaurants;

-- 좌표 통계
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
FROM restaurants;

-- 데이터 샘플
SELECT * FROM restaurants LIMIT 5;
```

### demo_users 테이블

```sql
SELECT COUNT(*) FROM demo_users;
SELECT * FROM demo_users LIMIT 10;
```

### demo_reservations 테이블

```sql
SELECT COUNT(*) FROM demo_reservations;
SELECT * FROM demo_reservations LIMIT 10;
```

### notifications 테이블

```sql
SELECT COUNT(*) FROM notifications;
SELECT * FROM notifications ORDER BY id DESC LIMIT 10;
```

## 🔍 검색 예제

### 키워드로 검색

```sql
-- 레스토랑 이름으로 검색
SELECT * FROM restaurants 
WHERE restaurant_name LIKE '%명동%' 
LIMIT 10;

-- 지역명으로 검색
SELECT * FROM restaurants 
WHERE region_name LIKE '%강남%' 
LIMIT 10;
```

### 조건부 검색

```sql
-- 좌표가 있고 주소가 있는 레스토랑
SELECT id, restaurant_name, lat, lng, road_address
FROM restaurants
WHERE lat IS NOT NULL 
  AND lng IS NOT NULL 
  AND road_address IS NOT NULL
LIMIT 10;

-- 특정 상태의 레스토랑
SELECT * FROM restaurants 
WHERE status = 'NORMAL' 
LIMIT 10;
```

## 📊 데이터베이스 크기 확인

```sql
-- 전체 데이터베이스 크기
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'chopplan'
GROUP BY table_schema;

-- 테이블별 크기
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'chopplan'
ORDER BY (data_length + index_length) DESC;
```

## 💡 유용한 명령어 모음

```sql
-- 모든 테이블의 레코드 수 한 번에 확인
SELECT 
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = 'chopplan'
ORDER BY table_rows DESC;

-- restaurants 테이블 구조 확인
DESCRIBE restaurants;

-- 특정 테이블의 컬럼 목록
SHOW COLUMNS FROM restaurants;

-- 인덱스 확인
SHOW INDEX FROM restaurants;
```

## 🛠️ 스크립트 파일

- `check-database-data.bat` - 전체 데이터베이스 정보 확인
- `view-restaurants-data.bat` - restaurants 테이블 상세 확인

## ✅ 빠른 체크

가장 빠른 확인:
```bash
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) as total, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates FROM restaurants;"
```





