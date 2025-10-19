# 🎨 캐치테이블 스타일 재디자인 계획

## 📋 전체 구조

### 네비게이션 (가로 전체)
```
┌─────────────────────────────────────────────────────────────────┐
│  🍽️ Chopplan                                      🔔 알림  👤 로그인 │
├─────────────────────────────────────────────────────────────────┤
│    홈    |    검색    |    내주변    |    예약    |    마이    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ 홈 페이지

### 레이아웃
```
┌─────────────────────────────────────┐
│  인기 검색어: #강남 #스시 #데이트   │
├─────────────────────────────────────┤
│  [카테고리] [음식종류] [장소]      │
│  한식  중식  일식  양식  ...       │
├─────────────────────────────────────┤
│  🔥 인기 식당 TOP 10                │
│  ┌───┬───┬───┬───┬───┐            │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │            │
│  └───┴───┴───┴───┴───┘            │
│  ┌───┬───┬───┬───┬───┐            │
│  │ 6 │ 7 │ 8 │ 9 │10 │            │
│  └───┴───┴───┴───┴───┘            │
├─────────────────────────────────────┤
│  📍 강남 맛집                        │
│  [테이블 형식 목록]                 │
└─────────────────────────────────────┘
```

### 기능
- 카테고리/음식종류/장소 필터 버튼
- 클릭 수 기반 인기 식당 (카드 형식)
- 지역별 맛집 테이블

---

## 2️⃣ 검색 페이지

### 레이아웃
```
┌─────────────────────────────────────┐
│  🔍 [검색어 입력]             [검색] │
├─────────────────────────────────────┤
│  인기 검색어                         │
│  #1 강남역 맛집    #2 스시          │
│  #3 이태원 데이트  #4 홍대 술집     │
├─────────────────────────────────────┤
│  검색 결과 (카드뷰 - 지도 없음)     │
│  ┌─────────────────────┐            │
│  │ 식당 이미지         │            │
│  │ 식당명              │            │
│  │ ⭐4.5 | 리뷰 123    │            │
│  └─────────────────────┘            │
└─────────────────────────────────────┘
```

### 기능
- 카카오 API로 위경도 자동 조회
- 검색어 통계 누적
- 카드뷰로 깔끔하게 표시

---

## 3️⃣ 내주변 페이지

### 레이아웃
```
현재 localhost:3000과 동일
- 지도 + 식당 목록
- 카카오맵 연동
```

---

## 4️⃣ 예약 페이지

### 레이아웃
```
┌─────────────────────────────────────┐
│  내 예약 목록                        │
├─────────────────────────────────────┤
│  2025-10-15 (D-3)                   │
│  ┌─────────────────────┐            │
│  │ 스시코우지          │            │
│  │ 19:00 | 2명         │            │
│  │ [예약취소]          │            │
│  └─────────────────────┘            │
├─────────────────────────────────────┤
│  2025-10-10 (방문완료)              │
│  ┌─────────────────────┐            │
│  │ 더플레이스 다이닝   │            │
│  │ [리뷰 작성] (5일내) │            │
│  └─────────────────────┘            │
└─────────────────────────────────────┘
```

### 기능
- 날짜 오름차순 정렬
- 방문 후 5일 이내 리뷰 작성 버튼
- 예약 상태별 표시

---

## 5️⃣ 마이 페이지

### 레이아웃
```
┌─────────────────────────────────────┐
│  프로필                              │
│  👤 홍길동                           │
│  user@example.com                   │
├─────────────────────────────────────┤
│  회원정보 수정                       │
│  알림 설정                           │
│  내 리뷰                             │
│  찜한 식당                           │
│  로그아웃                            │
└─────────────────────────────────────┘
```

---

## 🗄️ 데이터베이스 스키마 (추가)

### 1. restaurant_clicks (클릭 통계)
```sql
CREATE TABLE restaurant_clicks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id BIGINT NOT NULL,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

### 2. search_keywords (검색어 통계)
```sql
CREATE TABLE search_keywords (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  keyword VARCHAR(100) NOT NULL,
  search_count INT DEFAULT 1,
  last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_keyword (keyword),
  INDEX idx_search_count (search_count DESC)
);
```

### 3. user_favorites (찜)
```sql
CREATE TABLE user_favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  restaurant_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES demo_users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  UNIQUE KEY unique_favorite (user_id, restaurant_id)
);
```

---

## 📂 파일 구조

```
frontend/src/
├── pages/
│   ├── HomePage.js           # 홈 (인기식당, 카테고리)
│   ├── SearchPage.js         # 검색 (카드뷰)
│   ├── NearbyPage.js         # 내주변 (현재 메인과 동일)
│   ├── MyReservationsPage.js # 예약 목록
│   └── MyPage.js             # 마이페이지
├── components/
│   ├── TopNav.js             # 상단 네비게이션
│   ├── MainNav.js            # 메인 네비게이션 (5개 메뉴)
│   ├── NotificationBell.js   # 알림 아이콘
│   ├── PopularRestaurants.js # 인기 식당 섹션
│   ├── CategoryFilter.js     # 카테고리 필터
│   └── RestaurantCard.js     # 식당 카드 컴포넌트
└── services/
    ├── clickService.js       # 클릭 통계 API
    └── searchService.js      # 검색 통계 API
```

---

## 🔄 구현 단계

### Phase 1: DB & API (백엔드)
- [ ] 통계 테이블 생성
- [ ] 클릭 통계 API
- [ ] 검색어 통계 API
- [ ] 인기 식당 조회 API
- [ ] 카카오맵 위경도 조회 API

### Phase 2: 네비게이션 & 레이아웃
- [ ] 새 네비게이션 컴포넌트
- [ ] 알림 컴포넌트
- [ ] 라우팅 재구성

### Phase 3: 페이지 구현
- [ ] 홈 페이지
- [ ] 검색 페이지
- [ ] 내주변 페이지 (기존 재활용)
- [ ] 예약 페이지
- [ ] 마이 페이지

### Phase 4: 고급 기능
- [ ] 클릭 트래킹
- [ ] 검색어 트래킹
- [ ] 리뷰 작성 (5일 제한)
- [ ] 푸시 알림

---

## 🎨 디자인 가이드

### 색상
- Primary: #FF5A5F (캐치테이블 레드)
- Secondary: #484848 (다크 그레이)
- Background: #FFFFFF
- Border: #EBEBEB

### 타이포그래피
- Heading: 'Pretendard', sans-serif
- Body: 'Apple SD Gothic Neo'

### 간격
- Container: max-width 1200px
- Padding: 20px
- Gap: 16px

---

이 계획으로 진행하시겠습니까? 단계별로 천천히 구현하겠습니다! 🚀


