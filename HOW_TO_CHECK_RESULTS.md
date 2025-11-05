# 🔍 API 호출 결과 확인 방법

## 📋 curl 명령어 실행 결과 확인

### 방법 1: 터미널/커맨드 프롬프트에서 직접 확인 (가장 간단)

**Windows PowerShell:**
```powershell
curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"
```

**Windows CMD:**
```cmd
curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"
```

**결과가 바로 화면에 출력됩니다!**

예시:
```json
[
  {
    "id": 1,
    "restaurantName": "맥도날드",
    "lat": 37.4979,
    "lng": 127.0276,
    "roadAddress": "서울특별시 강남구..."
  },
  ...
]
```

---

### 방법 2: 브라우저에서 확인 (가장 쉬움)

**브라우저 주소창에 입력:**
```
http://localhost:8080/api/restaurants/search?keyword=맥도날드
```

**또는 한글은 URL 인코딩:**
```
http://localhost:8080/api/restaurants/search?keyword=%EB%A7%A5%EB%8F%84%EB%82%A0%EB%93%9C
```

**브라우저에 JSON이 예쁘게 표시됩니다!**

---

### 방법 3: 백엔드 콘솔 로그 확인 (처리 과정 확인)

**백엔드를 실행한 터미널/콘솔 창에서:**

다음과 같은 로그들이 출력됩니다:

```
[INFO] Search request received for keyword: 맥도날드
[INFO] Found X restaurants from DB for keyword: 맥도날드
[INFO] Processing X restaurants for real-time coordinate update
[INFO] Searching coordinates for: 맥도날드
[INFO] ✅ Updated coordinates for 맥도날드 (query: 맥도날드): lat=37.4979, lng=127.0276, address=서울...
```

**로그에서 확인할 수 있는 정보:**
- 몇 개의 식당을 찾았는지
- 좌표 업데이트 성공/실패 여부
- 에러 메시지 (있는 경우)

---

### 방법 4: 데이터베이스에서 직접 확인

**DBeaver 사용:**

1. DBeaver 실행
2. `chopplan` 데이터베이스 연결
3. SQL 편집기 열기 (`Ctrl+\`)
4. 다음 쿼리 실행:

```sql
-- 맥도날드 검색
SELECT id, restaurant_name, branch_name, lat, lng, road_address
FROM restaurants
WHERE restaurant_name LIKE '%맥도날드%'
ORDER BY id;

-- 좌표 통계 확인
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coordinates
FROM restaurants;
```

---

### 방법 5: 테스트 스크립트 실행

**만든 스크립트 실행:**
```bash
test-api-after-restart.bat
```

이 스크립트가 자동으로 여러 테스트를 실행하고 결과를 보여줍니다.

---

## 🎯 추천 방법

### 가장 빠른 확인:
1. **브라우저 사용**: 주소창에 URL 입력
   ```
   http://localhost:8080/api/restaurants/search?keyword=맥도날드
   ```

### 가장 상세한 확인:
2. **백엔드 로그 확인**: 처리 과정과 결과를 모두 볼 수 있음

### 실제 데이터 확인:
3. **DBeaver 사용**: 데이터베이스에 실제로 저장되었는지 확인

---

## 📊 응답 예시

**성공 응답:**
```json
[
  {
    "id": 1,
    "restaurantName": "맥도날드 강남점",
    "branchName": "강남점",
    "regionName": "강남구",
    "lat": 37.4979,
    "lng": 127.0276,
    "roadAddress": "서울특별시 강남구 테헤란로 152",
    "phoneNumber": "02-1234-5678",
    ...
  }
]
```

**에러 응답:**
```json
{
  "error": "Error message here"
}
```

---

## 💡 팁

### JSON 예쁘게 보기 (브라우저 확장 프로그램)
- Chrome/Edge: JSON Formatter
- 또는 온라인 JSON 뷰어 사용

### PowerShell에서 JSON 포맷팅
```powershell
curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드" | ConvertFrom-Json | ConvertTo-Json -Depth 10
```





