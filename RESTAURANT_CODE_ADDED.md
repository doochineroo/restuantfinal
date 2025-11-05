# 식당 코드(restaurant_code) 추가 완료

## 변경 사항

### 1. Restaurant 엔티티에 `restaurant_code` 컬럼 추가
- **파일**: `src/main/java/com/example/choprest/entity/Restaurant.java`
- **변경**: CSV의 "식당(ID)"를 저장하는 `restaurant_code` 컬럼 추가
- **용도**: 회원가입 시 식당 코드로 식당을 찾아서 연결

```java
@Column(name = "restaurant_code", unique = true)
private Long restaurantCode; // CSV의 식당 ID (회원가입 시 식당 연결용)
```

### 2. RestaurantRepository에 식당 코드 검색 메서드 추가
- **파일**: `src/main/java/com/example/choprest/repository/RestaurantRepository.java`
- **메서드**: `findByRestaurantCode(Long restaurantCode)`

### 3. RestaurantService 수정
- **파일**: `src/main/java/com/example/choprest/service/RestaurantService.java`
- **변경 사항**:
  - CSV 로드 시 `restaurant_code`에 CSV의 식당 ID 저장 (기존 `id`는 자동 생성)
  - `getRestaurantByCode()` 메서드 추가

### 4. SignupRequest에 `restaurantCode` 필드 추가
- **파일**: `src/main/java/com/example/choprest/demo/dto/SignupRequest.java`
- **변경**: 회원가입 시 식당 코드로 식당을 찾을 수 있도록 필드 추가

### 5. AuthService 수정
- **파일**: `src/main/java/com/example/choprest/demo/service/AuthService.java`
- **변경**: 회원가입 시 `restaurantCode`로 식당을 찾아서 연결하는 로직 추가

## 사용 방법

### 회원가입 시 식당 연결 방법

1. **DB의 id 사용** (기존 방식):
   ```json
   {
     "role": "OWNER",
     "restaurantId": 123
   }
   ```

2. **식당 코드 사용** (새로운 방식 - CSV의 식당 ID):
   ```json
   {
     "role": "OWNER",
     "restaurantCode": 10012
   }
   ```

3. **새 식당 등록** (기존 방식):
   ```json
   {
     "role": "OWNER",
     "restaurantName": "새 식당",
     "roadAddress": "서울시 강남구..."
   }
   ```

## 데이터베이스 업데이트

백엔드를 실행하면 자동으로 `restaurants` 테이블에 `restaurant_code` 컬럼이 추가됩니다.

기존 데이터가 있는 경우:
1. 백엔드를 실행하여 컬럼 추가
2. CSV 데이터를 다시 로드하면 `restaurant_code`가 자동으로 채워집니다

## 주의사항

- `restaurant_code`는 `unique = true`로 설정되어 있어 중복될 수 없습니다
- CSV의 식당 ID가 중복되지 않아야 합니다
- 기존 데이터가 있는 경우 CSV를 다시 로드해야 `restaurant_code`가 채워집니다

