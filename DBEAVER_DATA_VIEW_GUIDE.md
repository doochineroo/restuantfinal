# 🔍 DBeaver에서 데이터 확인 방법

## 📋 1단계: 연결 설정

### 새 연결 만들기

1. **DBeaver 실행**
2. **데이터베이스 연결** → **새로 만들기** 클릭 (또는 `Ctrl+Shift+N`)
3. **MySQL** 선택 → **다음**

### 연결 정보 입력

**일반 탭:**
```
메인:
  Host: localhost
  Port: 3306
  Database: chopplan
  Username: root
  Password: 1234
```

**완료** 버튼 클릭

## 📊 2단계: 데이터 확인 방법

### 방법 1: 테이블 선택 후 데이터 보기 (가장 쉬움)

1. **왼쪽 데이터베이스 네비게이터**에서:
   ```
   chopplan (MySQL)
     └─ Tables
        ├─ restaurants
        ├─ demo_users
        └─ ...
   ```

2. **테이블 선택** (예: `restaurants`)
   - 우클릭 → **"데이터 읽기"** 또는 **"View Data"**
   - 또는 테이블 더블클릭

3. **데이터 확인**
   - 모든 컬럼과 데이터가 테이블 형식으로 표시됨
   - 상단의 **▶ 재실행** 버튼으로 새로고침

### 방법 2: SQL 편집기 사용 (더 유연함)

1. **SQL 편집기 열기**
   - 상단 메뉴: **SQL 편집기** → **새 SQL 편집기**
   - 또는 `Ctrl+\` 단축키

2. **SQL 쿼리 작성**

   ```sql
   -- restaurants 테이블 전체 확인
   SELECT * FROM restaurants LIMIT 100;

   -- 레코드 수 확인
   SELECT COUNT(*) FROM restaurants;

   -- 좌표 통계
   SELECT 
       COUNT(*) as total,
       COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
       COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
   FROM restaurants;

   -- 샘플 데이터 (좌표 있는 것만)
   SELECT id, restaurant_name, branch_name, lat, lng, road_address
   FROM restaurants
   WHERE lat IS NOT NULL AND lng IS NOT NULL
   LIMIT 10;

   -- 특정 레스토랑 검색
   SELECT * FROM restaurants 
   WHERE restaurant_name LIKE '%명동%'
   LIMIT 10;
   ```

3. **실행**
   - `Ctrl+Enter` 또는 상단의 **▶ 실행** 버튼
   - 또는 SQL 문 선택 후 `Alt+X`

### 방법 3: 테이블 구조 확인

1. **테이블 선택**
2. **우클릭** → **"속성"** 또는 **"Properties"**
3. **컬럼** 탭에서 모든 컬럼 정보 확인

## 🔍 주요 확인 명령어

### restaurants 테이블

```sql
-- 전체 레코드 수
SELECT COUNT(*) FROM restaurants;

-- 좌표 통계
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
FROM restaurants;

-- 모든 데이터 (주의: 많으면 시간 걸림)
SELECT * FROM restaurants;

-- 샘플 데이터 (10개)
SELECT * FROM restaurants LIMIT 10;

-- 좌표 있는 레스토랑만
SELECT id, restaurant_name, branch_name, lat, lng, road_address
FROM restaurants
WHERE lat IS NOT NULL AND lng IS NOT NULL
LIMIT 20;

-- 좌표 없는 레스토랑만
SELECT id, restaurant_name, branch_name, lat, lng
FROM restaurants
WHERE lat IS NULL OR lng IS NULL
LIMIT 20;
```

### 다른 테이블 확인

```sql
-- demo_users
SELECT COUNT(*) FROM demo_users;
SELECT * FROM demo_users LIMIT 10;

-- demo_reservations
SELECT COUNT(*) FROM demo_reservations;
SELECT * FROM demo_reservations LIMIT 10;

-- notifications
SELECT COUNT(*) FROM notifications;
SELECT * FROM notifications ORDER BY id DESC LIMIT 10;
```

### 테이블 목록 및 레코드 수

```sql
-- 모든 테이블 목록
SHOW TABLES;

-- 테이블별 레코드 수
SELECT 
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = 'chopplan'
ORDER BY table_rows DESC;
```

## 💡 유용한 팁

### 1. 결과 내보내기

- SQL 실행 결과에서 우클릭 → **"데이터 내보내기"**
- Excel, CSV 등으로 저장 가능

### 2. 필터링

- 데이터 보기 모드에서 컬럼 헤더 클릭으로 정렬
- 상단 검색창에서 데이터 검색

### 3. 조건부 필터

- 테이블 데이터 보기에서 우클릭 → **"필터 설정"**
- 원하는 조건 입력

### 4. 데이터 편집

- 데이터 보기에서 직접 수정 가능 (주의 필요)
- 변경 후 **커밋** 필요

## 🎯 빠른 확인 체크리스트

- [ ] DBeaver 연결 설정 완료 (localhost:3306, chopplan)
- [ ] 테이블 목록 확인 (SHOW TABLES)
- [ ] restaurants 테이블 데이터 확인
- [ ] 레코드 수 확인 (SELECT COUNT(*))
- [ ] 좌표 통계 확인

## ❓ 문제 해결

### 연결 오류
- MySQL 서버가 실행 중인지 확인
- 호스트: `localhost` (AWS RDS 주소 아님!)
- 비밀번호: `1234`

### 데이터가 안 보임
- 백엔드 실행하여 CSV 데이터 로드 확인
- `SELECT COUNT(*) FROM restaurants;`로 레코드 수 확인

### SQL 실행 오류
- SQL 문 끝에 세미콜론(`;`) 확인
- 따옴표 사용 확인





