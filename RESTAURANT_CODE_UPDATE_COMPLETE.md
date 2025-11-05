# restaurant_code 업데이트 완료

## 완료된 작업

1. ✅ **데이터 400개만 유지**: id가 400보다 큰 데이터 삭제 완료
2. ✅ **CSV 로드 최대 개수 변경**: 500개 → 400개
3. ✅ **중복 체크 로직**: restaurant_code 기준으로 중복 방지
4. ✅ **restaurant_code 컬럼**: 이미 추가되어 있음

## 현재 상태

- restaurants 테이블: 400개 데이터
- restaurant_code 컬럼: 존재함
- CSV 로드: 처음 400개만 로드

## 다음 단계

백엔드가 실행되면:
1. CSV에서 처음 400개를 로드
2. restaurant_code 기준으로 중복 체크
3. 기존 데이터가 있으면 업데이트하지 않고 스킵
4. 새로운 데이터만 추가

## restaurant_code 업데이트 방법

현재 데이터의 restaurant_code를 업데이트하려면:

1. **방법 1 (권장)**: 기존 데이터 삭제 후 CSV 다시 로드
   ```sql
   DELETE FROM restaurants;
   ```
   그 다음 백엔드 실행 → CSV에서 처음 400개 자동 로드

2. **방법 2**: 기존 데이터 유지하면서 restaurant_code만 업데이트
   - 식당명과 지점명으로 CSV와 매칭
   - restaurant_code 업데이트

## 확인 방법

백엔드 로그에서 확인:
- `Loading restaurants from CSV and checking duplicates by restaurant_code...`
- `Successfully loaded X new restaurants from CSV (Y duplicates skipped)`

데이터베이스에서 확인:
```sql
SELECT id, restaurant_code, restaurant_name FROM restaurants LIMIT 10;
```

