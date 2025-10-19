# 🎯 캐치테이블 스타일 재디자인 - 진행 상황

## ✅ Phase 1: 백엔드 API (완료!)

### 1. 데이터베이스 스키마 ✅
- `catchable-schema.sql` 생성
- ✅ `restaurant_clicks` - 클릭 통계
- ✅ `search_keywords` - 검색어 통계  
- ✅ `user_favorites` - 찜 기능
- ✅ `notifications` - 알림
- ✅ `restaurants` 테이블에 `food_category`, `price_range`, `view_count` 추가
- ✅ `popular_restaurants` VIEW 생성
- ✅ `popular_keywords` VIEW 생성

### 2. 엔티티 (Entity) ✅
- ✅ `RestaurantClick.java` - 클릭 기록
- ✅ `SearchKeyword.java` - 검색어
- ✅ `UserFavorite.java` - 찜
- ✅ `Notification.java` - 알림

### 3. Repository ✅
- ✅ `RestaurantClickRepository.java`
- ✅ `SearchKeywordRepository.java`
- ✅ `UserFavoriteRepository.java`
- ✅ `NotificationRepository.java`
- ✅ `RestaurantRepository.java` - 카테고리 검색 메소드 추가

### 4. Service ✅
- ✅ `StatisticsService.java` - 클릭/검색 통계
- ✅ `FavoriteService.java` - 찜 관리
- ✅ `NotificationService.java` - 알림 관리
- ✅ `RestaurantService.java` - 카테고리별 검색 추가

### 5. Controller (API 엔드포인트) ✅
- ✅ `StatisticsController.java`
  - POST `/api/statistics/click` - 클릭 기록
  - POST `/api/statistics/search` - 검색어 기록
  - GET `/api/statistics/popular-restaurants` - 인기 식당 TOP 10
  - GET `/api/statistics/popular-keywords` - 인기 검색어 TOP 10

- ✅ `FavoriteController.java`
  - POST `/api/favorites` - 찜 추가
  - DELETE `/api/favorites` - 찜 제거
  - POST `/api/favorites/toggle` - 찜 토글
  - GET `/api/favorites/{userId}` - 사용자 찜 목록
  - GET `/api/favorites/check` - 찜 여부 확인

- ✅ `NotificationController.java`
  - GET `/api/notifications/{userId}` - 알림 목록
  - GET `/api/notifications/{userId}/unread` - 읽지 않은 알림
  - GET `/api/notifications/{userId}/unread-count` - 읽지 않은 알림 개수
  - PUT `/api/notifications/{id}/read` - 알림 읽음 처리
  - PUT `/api/notifications/{userId}/read-all` - 모두 읽음 처리

- ✅ `RestaurantController.java` (기존 + 확장 필요)
  - GET `/api/restaurants/category/{category}` - 카테고리별 조회
  - GET `/api/restaurants/categories` - 카테고리 목록
  - GET `/api/restaurants/region/{region}/category/{category}` - 지역+카테고리

---

## 🔄 Phase 2: 프론트엔드 (시작 예정)

### 작업 목록

#### 1. 공통 컴포넌트
- [ ] `TopNav.js` - 상단 네비게이션 (로고, 알림, 로그인)
- [ ] `MainNav.js` - 메인 네비게이션 (홈/검색/내주변/예약/마이)
- [ ] `NotificationBell.js` - 알림 아이콘 (배지)
- [ ] `CategoryFilter.js` - 카테고리 필터 버튼
- [ ] `RestaurantCard.js` - 식당 카드 컴포넌트

#### 2. 페이지
- [ ] `HomePage.js` - 인기 식당, 카테고리별 보기
- [ ] `SearchPage.js` - 검색 (카드뷰, 인기 검색어)
- [ ] `NearbyPage.js` - 내주변 (기존 메인 페이지 활용)
- [ ] `MyReservationsPage.js` - 내 예약 목록
- [ ] `MyPage.js` - 회원 정보

#### 3. 서비스 (API 호출)
- [ ] `statisticsService.js` - 통계 API
- [ ] `favoriteService.js` - 찜 API
- [ ] `notificationService.js` - 알림 API

---

## 📊 API 사용 예시

### 인기 식당 조회
```javascript
// GET /api/statistics/popular-restaurants?limit=10
const response = await axios.get('/api/statistics/popular-restaurants', {
  params: { limit: 10 }
});
```

### 클릭 기록
```javascript
// POST /api/statistics/click
await axios.post('/api/statistics/click', {
  restaurantId: 123,
  userId: 456 // null 가능 (비로그인)
});
```

### 검색어 기록
```javascript
// POST /api/statistics/search
await axios.post('/api/statistics/search', {
  keyword: '강남 맛집'
});
```

### 찜 토글
```javascript
// POST /api/favorites/toggle
const response = await axios.post('/api/favorites/toggle', {
  userId: 123,
  restaurantId: 456
});
console.log(response.data.isFavorited); // true or false
```

### 읽지 않은 알림 개수
```javascript
// GET /api/notifications/123/unread-count
const response = await axios.get('/api/notifications/123/unread-count');
console.log(response.data.count); // 5
```

---

## 🗄️ 데이터베이스 설정

### 1. 스키마 적용
```bash
mysql -u root -p choprest < catchable-schema.sql
```

### 2. 확인
```sql
-- 테이블 확인
SHOW TABLES;

-- 카테고리 분포
SELECT food_category, COUNT(*) as count 
FROM restaurants 
GROUP BY food_category;

-- 인기 식당 VIEW 확인
SELECT * FROM popular_restaurants LIMIT 10;
```

---

## 🎯 다음 단계

1. **RestaurantController 확장** - 카테고리 API 엔드포인트 추가
2. **프론트엔드 구조 재구성** - 새로운 네비게이션 및 페이지 생성
3. **디자인 적용** - 캐치테이블 스타일 UI 구현
4. **기능 연동** - 클릭 트래킹, 검색어 트래킹, 찜, 알림

---

## 📝 중요 노트

### 기존 기능 유지
- ✅ 카카오맵 위경도 불러오기 (DB 식당만)
- ✅ 지도 + 목록 뷰 (내주변 페이지에서)
- ✅ 예약 시스템
- ✅ 리뷰 시스템
- ✅ Demo 인증 시스템

### 새로운 기능
- 🆕 클릭 수 기반 인기 식당
- 🆕 검색어 통계 및 인기 검색어
- 🆕 찜 기능
- 🆕 실시간 알림 (푸시)
- 🆕 카테고리별 필터링
- 🆕 5일 이내 리뷰 작성 알림

---

**현재 상태: Phase 1 완료, Phase 2 준비 중** 🚀


