# 🚀 좌표 업데이트 실행 방법

## 📋 준비사항

1. ✅ MySQL 서버 실행 중
2. ✅ `chopplan` 데이터베이스 생성 완료
3. ✅ 백엔드 실행 가능 상태

---

## 🔹 방법 1: 백엔드 실행 후 자동 업데이트 (가장 쉬움)

### 1단계: 백엔드 실행

```bash
gradlew.bat bootRun
```

또는 이미 실행 중이라면 그대로 사용

### 2단계: 식당 검색 API 호출 (자동으로 좌표 업데이트됨)

```bash
# 브라우저에서 접속하거나
http://localhost:8080/api/restaurants/search?keyword=맥도날드

# 또는 curl 사용
curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"
```

**동작 방식:**
- 검색된 식당 중 좌표가 없는 식당은 자동으로 Kakao API를 호출하여 업데이트
- 업데이트된 좌표가 자동으로 데이터베이스에 저장됨

---

## 🔹 방법 2: 배치 업데이트 API 호출

### 좌표가 없는 모든 식당 일괄 업데이트

```bash
# POST 요청으로 배치 업데이트
curl -X POST "http://localhost:8080/api/restaurants/update-coordinates" -H "Content-Type: application/json"

# 또는 브라우저에서 접속 (GET 요청인 경우)
http://localhost:8080/api/restaurants/update-coordinates
```

**주의:** 이 방법은 좌표가 없는 모든 식당에 대해 Kakao API를 호출하므로 시간이 오래 걸릴 수 있습니다.

---

## 🔹 방법 3: 프록시 API 직접 테스트

### Kakao API 프록시 테스트

```bash
# 프록시를 통한 Kakao API 호출
curl "http://localhost:8080/api/restaurants/kakao/search?query=맥도날드%20강남"

# 응답 예시:
# {
#   "documents": [{
#     "x": "127.0276",
#     "y": "37.4979",
#     "road_address_name": "서울특별시 강남구..."
#   }]
# }
```

이 방법은 API 응답만 확인하고, 데이터베이스에는 저장하지 않습니다.

---

## 🔹 방법 4: 단일 식당 좌표 업데이트

### 특정 식당 ID로 좌표 업데이트

```bash
# 식당 ID로 조회 및 업데이트
curl "http://localhost:8080/api/restaurants/1"
```

식당 상세 정보를 조회하면 좌표가 없을 경우 자동으로 업데이트 시도합니다.

---

## 🧪 빠른 테스트 스크립트

### `test-coordinate-update.bat`

```batch
@echo off
chcp 65001 >nul
echo ============================================
echo    좌표 업데이트 테스트
echo ============================================
echo.

echo 1. 백엔드가 실행 중인지 확인...
echo    http://localhost:8080/api/restaurants/search?keyword=맥도날드
echo.

echo 2. 프록시 API 테스트...
curl "http://localhost:8080/api/restaurants/kakao/search?query=맥도날드"
echo.

echo 3. 식당 검색 (자동 좌표 업데이트)...
curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"
echo.

pause
```

---

## 📊 실행 확인 방법

### 1. 데이터베이스에서 확인

```sql
-- 좌표가 있는 식당 확인
SELECT id, restaurant_name, lat, lng, road_address
FROM restaurants
WHERE lat IS NOT NULL AND lng IS NOT NULL
LIMIT 10;

-- 좌표 통계 확인
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
FROM restaurants;
```

### 2. DBeaver에서 확인

1. DBeaver 실행
2. `chopplan` 데이터베이스 연결
3. `restaurants` 테이블 확인
4. `lat`, `lng`, `road_address` 컬럼이 채워져 있는지 확인

### 3. API 응답에서 확인

```bash
# 식당 상세 조회
curl "http://localhost:8080/api/restaurants/1"

# 좌표 통계 API
curl "http://localhost:8080/api/restaurants/statistics/coordinates"
```

---

## 🎯 전체 실행 순서 (처음부터)

### Step 1: MySQL 확인

```bash
mysql -u root -p1234 -e "USE chopplan; SELECT COUNT(*) FROM restaurants;"
```

### Step 2: 백엔드 실행

```bash
gradlew.bat bootRun
```

**성공 확인:**
- 로그에 `Started ChoprestApplication` 표시
- 에러 없이 실행

### Step 3: 좌표 업데이트 실행

**옵션 A - 검색으로 자동 업데이트:**
```bash
curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"
```

**옵션 B - 배치 업데이트:**
```bash
curl -X POST "http://localhost:8080/api/restaurants/update-coordinates"
```

### Step 4: 결과 확인

```bash
# 좌표 통계 확인
curl "http://localhost:8080/api/restaurants/statistics/coordinates"
```

또는 DBeaver에서 직접 확인

---

## ⚠️ 주의사항

1. **Kakao API 키 필요**: `application.properties`에 `kakao.api.key` 설정 필요
2. **API 호출 제한**: Kakao API는 호출 제한이 있으므로 너무 많은 요청을 한 번에 보내지 마세요
3. **시간 소요**: 많은 식당을 업데이트하는 경우 시간이 오래 걸릴 수 있습니다
4. **에러 처리**: API 호출 실패 시 로그를 확인하세요

---

## 🔍 문제 해결

### 백엔드가 실행되지 않음
- MySQL 서버가 실행 중인지 확인
- `application.properties`의 데이터베이스 설정 확인

### API 호출 실패
- Kakao API 키가 올바른지 확인
- 네트워크 연결 확인
- API 호출 제한 초과 여부 확인 (로그 확인)

### 좌표가 업데이트되지 않음
- Kakao API 응답 로그 확인
- 식당명이 정확한지 확인
- 데이터베이스 연결 확인

---

## 📝 요약

**가장 간단한 방법:**

1. 백엔드 실행: `gradlew.bat bootRun`
2. 브라우저에서 접속: `http://localhost:8080/api/restaurants/search?keyword=맥도날드`
3. DBeaver로 확인: `restaurants` 테이블에서 `lat`, `lng`, `road_address` 컬럼 확인

이것으로 끝! 🎉





