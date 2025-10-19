# 🎨 Catchable-like 디자인 리뉴얼 가이드

## 📋 목차
1. [개요](#개요)
2. [새로운 기능](#새로운-기능)
3. [페이지 구조](#페이지-구조)
4. [시작하기](#시작하기)
5. [API 엔드포인트](#api-엔드포인트)
6. [테스트 방법](#테스트-방법)

---

## 🎯 개요

Catchable과 유사한 현대적인 음식점 예약 플랫폼으로 리뉴얼했습니다.

### 주요 특징
- ✨ **모던 UI/UX**: 캐치테이블 스타일의 깔끔한 디자인
- 📊 **데이터 기반**: 클릭 수, 검색어 통계 수집
- 🔔 **실시간 알림**: 예약 승인, 리뷰 알림 등
- 💖 **찜 기능**: 관심 있는 식당 저장
- 🎯 **역할 기반**: USER, OWNER, ADMIN 구분

---

## 🆕 새로운 기능

### 1. 인기 식당 (Popular Restaurants)
- 클릭 수 기반 인기 식당 표시
- 실시간 통계 수집
- 순위 표시

### 2. 카테고리 탐색
- 음식 종류별 필터링
- 지역 + 카테고리 조합 검색
- 동적 카테고리 목록

### 3. 인기 검색어
- 검색어 자동 수집
- 검색 횟수 통계
- 빠른 검색 지원

### 4. 찜 기능
- 관심 식당 저장
- 마이페이지에서 관리
- 빠른 접근

### 5. 알림 시스템
- 예약 승인/거절 알림
- 리뷰 작성 알림 (5일 이내)
- 읽음/안읽음 관리

---

## 📱 페이지 구조

### 레이아웃
```
┌─────────────────────────────────┐
│  TopNav (로고, 알림, 로그인)      │
├─────────────────────────────────┤
│  MainNav (홈/검색/내주변/예약/마이) │
├─────────────────────────────────┤
│                                 │
│        Page Content             │
│                                 │
└─────────────────────────────────┘
```

### 페이지 목록

#### 1. 홈 (`/home`)
- **인기 맛집 섹션**: 클릭 수 기반 TOP 6
- **카테고리 필터**: 음식 종류별 탐색
- **테이블 뷰**: 깔끔한 식당 목록

**주요 컴포넌트**:
- `HomePage.js`
- `HomePage.css`

**API 사용**:
- `GET /api/statistics/popular-restaurants?limit=6`
- `GET /api/restaurants/categories`
- `GET /api/restaurants/category/{category}`

#### 2. 검색 (`/search`)
- **인기 검색어**: TOP 10 검색어 표시
- **카드 뷰**: 지도 없는 깔끔한 카드
- **검색어 트래킹**: 자동 통계 수집
- **Kakao API 연동**: 위경도 자동 조회

**주요 컴포넌트**:
- `SearchPage.js`
- `SearchPage.css`

**API 사용**:
- `GET /api/statistics/popular-keywords?limit=10`
- `POST /api/statistics/searches?keyword={keyword}`
- `GET /api/restaurants/search?keyword={keyword}`
- `POST /api/statistics/clicks?restaurantId={id}`

#### 3. 내주변 (`/near-me`)
- **기존 기능 재활용**: 지도 + 목록
- **위치 기반 검색**: 현재 위치 중심
- **반경 조절**: 1km ~ 10km

**주요 컴포넌트**:
- `NearMePage.js`
- `SearchSection.js`
- `MapSection.js`
- `RestaurantList.js`

#### 4. 예약 (`/reservations`)
- **역할별 뷰**:
  - USER: 내 예약 내역
  - OWNER: 가게 예약 내역
  - ADMIN: 전체 예약 내역
- **날짜 정렬**: 예약일 오름차순
- **5일 이내 리뷰**: 완료 후 5일 이내 리뷰 작성 버튼
- **상태 관리**: 대기/승인/거절/완료

**주요 컴포넌트**:
- `ReservationsPage.js` (pages)
- `ReservationsPage.css`

**API 사용**:
- `GET /api/demo/reservations/user/{userId}`
- `GET /api/demo/reservations/restaurant/{restaurantId}`
- `GET /api/demo/reservations/all`
- `PUT /api/demo/reservations/{id}/status?status={status}`

#### 5. 마이 (`/my`)
- **프로필 정보**: 이름, 이메일, 역할
- **찜 목록**: 관심 식당 관리
- **메뉴**: 예약/리뷰/알림/설정
- **관리자 페이지**: ADMIN 역할 전용

**주요 컴포넌트**:
- `MyPage.js`
- `MyPage.css`

**API 사용**:
- `GET /api/favorites/{userId}`
- `DELETE /api/favorites/{userId}/{restaurantId}`

#### 6. 알림 (`/notifications`)
- **알림 목록**: 모든 알림 표시
- **필터링**: 전체/읽지 않음/읽음
- **읽음 처리**: 개별/전체
- **삭제**: 불필요한 알림 제거

**주요 컴포넌트**:
- `NotificationsPage.js`
- `NotificationsPage.css`

**API 사용**:
- `GET /api/notifications/{userId}`
- `GET /api/notifications/{userId}/unread`
- `GET /api/notifications/{userId}/unread-count`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/{userId}/read-all`
- `DELETE /api/notifications/{id}`

---

## 🚀 시작하기

### 1. 데이터베이스 테이블 추가

```bash
# catchable-schema.sql 실행
mysql -u root -p chopplan < catchable-schema.sql
```

**생성되는 테이블**:
- `restaurant_clicks`: 식당 클릭 통계
- `search_keywords`: 검색어 통계
- `user_favorites`: 사용자 찜 목록
- `notifications`: 알림

### 2. 백엔드 시작

```bash
# 프로젝트 루트에서
gradlew bootRun
```

또는

```bash
QUICK_START.bat
```

### 3. 프론트엔드 시작

```bash
cd frontend
npm install
npm start
```

또는

```bash
cd frontend
START_FRONTEND.bat
```

### 4. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080

---

## 🔌 API 엔드포인트

### Statistics API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/statistics/clicks` | 식당 클릭 기록 |
| GET | `/api/statistics/popular-restaurants` | 인기 식당 조회 |
| POST | `/api/statistics/searches` | 검색어 기록 |
| GET | `/api/statistics/popular-keywords` | 인기 검색어 조회 |

### Favorites API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/favorites/{userId}` | 찜 목록 조회 |
| POST | `/api/favorites/{userId}/{restaurantId}` | 찜 추가 |
| DELETE | `/api/favorites/{userId}/{restaurantId}` | 찜 삭제 |
| GET | `/api/favorites/{userId}/{restaurantId}/exists` | 찜 여부 확인 |

### Notifications API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/notifications/{userId}` | 모든 알림 조회 |
| GET | `/api/notifications/{userId}/unread` | 읽지 않은 알림 |
| GET | `/api/notifications/{userId}/unread-count` | 읽지 않은 개수 |
| PUT | `/api/notifications/{id}/read` | 읽음 처리 |
| PUT | `/api/notifications/{userId}/read-all` | 전체 읽음 처리 |
| DELETE | `/api/notifications/{id}` | 알림 삭제 |

### Restaurants API (Extended)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/restaurants/categories` | 모든 카테고리 조회 |
| GET | `/api/restaurants/category/{category}` | 카테고리별 식당 |
| GET | `/api/restaurants/region/{region}/category/{category}` | 지역+카테고리 |

---

## 🧪 테스트 방법

### 1. 회원가입 & 로그인
1. http://localhost:3000 접속
2. 우측 상단 "로그인" 클릭
3. 테스트 계정으로 로그인:
   - **일반 회원**: `user1@test.com` / `password123`
   - **사장님**: `owner1@test.com` / `password123`
   - **관리자**: `admin@test.com` / `admin123`

### 2. 홈 페이지 테스트
1. 인기 맛집 확인
2. 카테고리 필터 클릭
3. 식당 카드 클릭 → 클릭 수 증가

### 3. 검색 기능 테스트
1. "검색" 메뉴 클릭
2. 인기 검색어 확인
3. 검색어 입력 후 검색
4. 검색어가 통계에 반영되는지 확인

### 4. 찜 기능 테스트
1. 식당 상세 페이지에서 ❤️ 클릭
2. "마이" → "찜한 맛집" 확인
3. 💔 클릭으로 찜 해제

### 5. 예약 & 알림 테스트
1. 식당에서 "예약하기"
2. "예약" 메뉴에서 예약 확인
3. 사장님 계정으로 로그인
4. 예약 승인/거절
5. 일반 회원 계정에서 알림 확인 (🔔)

### 6. 리뷰 작성 테스트
1. 완료된 예약에서 "리뷰 작성하기" (5일 이내)
2. 리뷰 작성
3. "마이" → "리뷰 관리"에서 확인

---

## 📂 파일 구조

```
frontend/src/
├── components/
│   ├── TopNav.js          # 상단 네비게이션
│   ├── TopNav.css
│   ├── MainNav.js         # 메인 메뉴
│   ├── MainNav.css
│   ├── NotificationBell.js # 알림 아이콘
│   └── NotificationBell.css
├── pages/
│   ├── HomePage.js        # 홈 페이지
│   ├── HomePage.css
│   ├── SearchPage.js      # 검색 페이지
│   ├── SearchPage.css
│   ├── NearMePage.js      # 내주변 페이지
│   ├── NearMePage.css
│   ├── ReservationsPage.js # 예약 페이지
│   ├── ReservationsPage.css
│   ├── MyPage.js          # 마이 페이지
│   ├── MyPage.css
│   ├── NotificationsPage.js # 알림 페이지
│   └── NotificationsPage.css
├── services/
│   └── apiService.js      # API 통합 서비스
└── App.js                 # 라우팅 설정

backend/src/main/java/com/example/choprest/
├── entity/
│   ├── RestaurantClick.java
│   ├── SearchKeyword.java
│   ├── UserFavorite.java
│   └── Notification.java
├── repository/
│   ├── RestaurantClickRepository.java
│   ├── SearchKeywordRepository.java
│   ├── UserFavoriteRepository.java
│   └── NotificationRepository.java
├── service/
│   ├── StatisticsService.java
│   ├── FavoriteService.java
│   └── NotificationService.java
└── controller/
    ├── StatisticsController.java
    ├── FavoriteController.java
    └── NotificationController.java
```

---

## 🎨 디자인 가이드

### 색상 팔레트
- **Primary**: `#ff5a5f` (빨강/핑크)
- **Secondary**: `#484848` (진한 회색)
- **Text**: `#717171` (회색)
- **Border**: `#e0e0e0` (연한 회색)
- **Background**: `#f9f9f9` (아주 연한 회색)

### 폰트 크기
- **H1**: 28px (모바일: 24px)
- **H2**: 24px (모바일: 20px)
- **H3**: 20px (모바일: 18px)
- **Body**: 15px (모바일: 14px)
- **Small**: 13px (모바일: 12px)

### 간격
- **Section Gap**: 60px (모바일: 40px)
- **Card Gap**: 24px (모바일: 16px)
- **Element Gap**: 12px (모바일: 8px)

### 반응형 브레이크포인트
- **Desktop**: 769px 이상
- **Mobile**: 768px 이하

---

## 🔧 커스터마이징

### 1. 인기 식당 개수 변경

```javascript
// HomePage.js
const popularResponse = await statisticsAPI.getPopularRestaurants(10); // 6 → 10
```

### 2. 인기 검색어 개수 변경

```javascript
// SearchPage.js
const response = await statisticsAPI.getPopularKeywords(15); // 10 → 15
```

### 3. 리뷰 작성 기한 변경

```javascript
// ReservationsPage.js
const canWriteReview = (reservation) => {
  // ...
  return daysDiff <= 7; // 5 → 7 (7일로 변경)
};
```

### 4. 알림 갱신 주기 변경

```javascript
// NotificationBell.js
const interval = setInterval(fetchUnreadCount, 60000); // 30초 → 60초
```

---

## 🐛 트러블슈팅

### 1. "식당이 표시되지 않습니다"
→ `catchable-schema.sql`을 실행했는지 확인
→ 백엔드 로그에서 SQL 오류 확인

### 2. "알림이 업데이트되지 않습니다"
→ 브라우저 개발자 도구 → Network 탭에서 API 호출 확인
→ CORS 설정 확인

### 3. "검색어가 기록되지 않습니다"
→ `/api/statistics/searches` POST 요청 성공 여부 확인
→ `search_keywords` 테이블 확인

### 4. "찜 기능이 작동하지 않습니다"
→ 로그인 여부 확인 (찜은 로그인 필수)
→ `user_favorites` 테이블 확인

---

## 📚 추가 문서
- [DEMO_README.md](./DEMO_README.md) - 데모 시스템 가이드
- [START_GUIDE.md](./START_GUIDE.md) - 시작 가이드
- [REDESIGN_PLAN.md](./REDESIGN_PLAN.md) - 리뉴얼 계획서

---

## 🙏 감사합니다!

Catchable-like 디자인 리뉴얼을 성공적으로 완료했습니다! 🎉

질문이나 문제가 있으시면 이슈를 열어주세요.


