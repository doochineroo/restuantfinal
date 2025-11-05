# restaurant_code 업데이트 로직 완료

## 완료된 작업

1. ✅ **데이터 400개만 유지**: id > 400인 데이터 삭제 완료
2. ✅ **CSV 로드 개수**: 400개로 제한
3. ✅ **중복 체크 로직**: restaurant_code 기준으로 중복 방지
4. ✅ **업데이트 로직 추가**: 기존 데이터의 restaurant_code 자동 업데이트

## 업데이트 로직 동작 방식

### 1. 기존 데이터 업데이트
- 기존 데이터를 **id 순서대로** 정렬 (1, 2, 3, ...)
- CSV 데이터를 **순서대로** 매칭
  - 첫 번째 CSV 데이터 → id 1의 restaurant_code 업데이트
  - 두 번째 CSV 데이터 → id 2의 restaurant_code 업데이트
  - ...
- `restaurant_code`가 NULL이거나 다르면 업데이트

### 2. 새로운 데이터 추가
- `restaurant_code` 기준으로 중복 체크
- 존재하지 않는 `restaurant_code`만 추가

## 백엔드 실행 시 로그 확인

다음 메시지들을 확인하세요:

```
INFO - Current restaurant count in database: 400
INFO - Loading restaurants from CSV and checking duplicates by restaurant_code...
INFO - Updating restaurant_code for existing 400 restaurants...
INFO - Updated restaurant_code for X existing restaurants
INFO - Successfully loaded Y new restaurants from CSV (Z duplicates skipped)
```

## 데이터 확인

백엔드 실행 후 데이터베이스에서 확인:

```sql
SELECT id, restaurant_code, restaurant_name FROM restaurants ORDER BY id LIMIT 10;
```

## 주의사항

- CSV의 순서와 데이터베이스의 id 순서가 일치해야 정확하게 매칭됩니다
- 만약 순서가 맞지 않으면 식당명/지점명으로 매칭하는 로직으로 변경할 수 있습니다

