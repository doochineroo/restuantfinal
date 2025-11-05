# 🗑️ 데이터베이스 정리 가이드

좌표가 없는 레스토랑을 삭제하여 데이터베이스 크기를 절약하는 방법입니다.

## 📋 개요

`lat` 또는 `lng`가 NULL인 레스토랑 레코드를 삭제하여 데이터베이스 크기를 줄입니다.

## 🔍 삭제 전 확인

### 1. SQL로 확인

```sql
-- 좌표 통계 조회
SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates
FROM restaurants;
```

### 2. API로 확인

```bash
# 좌표 통계 조회
curl http://localhost:8080/api/restaurants/statistics/coordinates
```

응답 예시:
```json
{
  "total": 1000,
  "withCoordinates": 800,
  "withoutCoordinates": 200
}
```

## 🗑️ 삭제 방법

### 방법 1: 배치 스크립트 사용 (권장)

```bash
# Windows
cleanup-restaurants.bat
```

스크립트가 다음을 수행합니다:
1. 삭제 전 데이터 확인
2. 삭제될 레코드 미리보기 (선택)
3. 사용자 확인
4. 삭제 실행
5. 삭제 후 확인
6. 테이블 최적화

### 방법 2: SQL 직접 실행

```bash
mysql -u root -p restaurant-demo < cleanup-restaurants-without-coordinates.sql
```

또는 MySQL Workbench/DBeaver에서 `cleanup-restaurants-without-coordinates.sql` 파일 실행

### 방법 3: API 사용

```bash
# 좌표가 없는 레스토랑 삭제
curl -X DELETE http://localhost:8080/api/restaurants/cleanup/without-coordinates
```

응답 예시:
```json
{
  "deletedCount": 200,
  "beforeStats": {
    "total": 1000,
    "withCoordinates": 800,
    "withoutCoordinates": 200
  },
  "afterStats": {
    "total": 800,
    "withCoordinates": 800,
    "withoutCoordinates": 0
  },
  "message": "Successfully deleted 200 restaurants without coordinates"
}
```

## 📊 데이터베이스 크기 확인

### SQL로 확인

```bash
mysql -u root -p restaurant-demo < check-database-size.sql
```

또는:

```sql
-- 전체 데이터베이스 크기
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'restaurant-demo'
GROUP BY table_schema;

-- 테이블별 크기
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'restaurant-demo'
ORDER BY (data_length + index_length) DESC;
```

## ⚠️ 주의사항

1. **백업 권장**: 삭제 전 데이터베이스 백업
   ```bash
   mysqldump -u root -p restaurant-demo > backup_$(date +%Y%m%d).sql
   ```

2. **복구 불가**: 삭제된 데이터는 복구할 수 없음

3. **외래 키**: 다른 테이블에서 참조하는 레코드가 있는지 확인
   ```sql
   -- 예: 예약 테이블에서 참조하는지 확인
   SELECT COUNT(*) FROM reservations r
   INNER JOIN restaurants res ON r.restaurant_id = res.id
   WHERE res.lat IS NULL OR res.lng IS NULL;
   ```

## 🔄 정기 정리 (선택사항)

정기적으로 정리하려면 스케줄러 설정:

### Windows 작업 스케줄러
1. 작업 스케줄러 열기
2. 기본 작업 만들기
3. 트리거: 매주/매월
4. 동작: `cleanup-restaurants.bat` 실행

### Cron (Linux/Mac)
```bash
# 매월 1일 자정에 실행
0 0 1 * * /path/to/cleanup-restaurants.sh
```

## 📈 예상 효과

- **데이터베이스 크기 감소**: 삭제된 레코드 수에 비례
- **쿼리 성능 향상**: 불필요한 데이터가 줄어들어 인덱스 효율 향상
- **저장 공간 절약**: 특히 대용량 이미지나 텍스트 필드가 있는 경우

## 🛠️ 문제 해결

### "Access denied" 오류
- MySQL 사용자 권한 확인
- `DELETE` 권한이 있는지 확인

### "Foreign key constraint" 오류
- 다른 테이블에서 참조하는 레코드는 삭제되지 않음
- 먼저 참조 데이터 삭제 후 재시도

### 삭제된 레코드 복구
```bash
# 백업에서 복구
mysql -u root -p restaurant-demo < backup_YYYYMMDD.sql
```

## 📝 관련 파일

- `cleanup-restaurants-without-coordinates.sql` - SQL 스크립트
- `cleanup-restaurants.bat` - Windows 배치 스크립트
- `check-database-size.sql` - 데이터베이스 크기 확인
- API 엔드포인트:
  - `GET /api/restaurants/statistics/coordinates` - 통계 조회
  - `DELETE /api/restaurants/cleanup/without-coordinates` - 삭제 실행

## ✅ 체크리스트

- [ ] 백업 생성
- [ ] 삭제 전 통계 확인
- [ ] 삭제될 레코드 미리보기
- [ ] 삭제 실행
- [ ] 삭제 후 확인
- [ ] 테이블 최적화
- [ ] 데이터베이스 크기 확인





