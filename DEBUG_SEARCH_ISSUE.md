# 🔍 검색 응답 없음 문제 디버깅

## 현재 상황
- ✅ 200 응답 (성공)
- ❌ 응답 본문이 비어있음 (빈 배열 `[]`)

---

## 🔎 원인 확인 단계

### 1단계: 데이터베이스 확인

**스크립트 실행:**
```bash
check-db-data-now.bat
```

**또는 직접:**
```bash
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) FROM restaurants;"
```

**확인 사항:**
- 총 식당 수가 0이 아닌지
- 맥도날드 검색 시 결과가 나오는지

---

### 2단계: 백엔드 로그 확인

**백엔드 콘솔에서 확인할 로그:**

```
[INFO] Search endpoint called with keyword: 맥도날드
[INFO] Search request received for keyword: 맥도날드
[INFO] Found X restaurants from DB for keyword: 맥도날드
[INFO] Returning X total restaurants...
```

**문제가 있는 경우:**
```
[WARN] ⚠️ Empty result list for keyword: 맥도날드
[WARN] DB search result was: 0 restaurants
```

---

### 3단계: API 직접 테스트

**통계 API:**
```
http://localhost:8080/api/restaurants/statistics/coordinates
```

**전체 식당 조회:**
```
http://localhost:8080/api/restaurants/all
```

**맥도날드 검색:**
```
http://localhost:8080/api/restaurants/search?keyword=맥도날드
```

---

## 🔧 가능한 원인 및 해결

### 원인 1: 데이터베이스가 비어있음

**해결:**
```bash
# CSV 데이터 로드
force-load-data.bat
```

### 원인 2: 검색 키워드가 매칭되지 않음

**해결:**
- 다른 키워드로 테스트: `강남`, `버거킹`, `피자`
- 전체 식당 조회: `/api/restaurants/all`

### 원인 3: JSON 직렬화 문제

**확인:**
- 브라우저 개발자 도구 (F12) → Network 탭
- Response 탭에서 실제 응답 확인

---

## 📝 다음 단계

1. **백엔드 로그 확인** (가장 중요!)
2. **데이터베이스 데이터 확인**
3. **다른 API 테스트** (`/all`, `/statistics/coordinates`)

백엔드 로그 메시지를 알려주시면 더 정확히 진단할 수 있습니다!





