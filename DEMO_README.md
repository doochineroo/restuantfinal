# 🧪 데모 인증/예약 시스템 사용 가이드

> ⚠️ **중요**: 이 시스템은 테스트 및 데모 목적으로 제작되었습니다.  
> 실제 운영 환경에서는 보안이 강화된 인증 시스템(Spring Security + JWT 등)을 사용해야 합니다.

---

## 📋 목차

1. [시스템 구성](#시스템-구성)
2. [빠른 시작](#빠른-시작)
3. [테스트 계정](#테스트-계정)
4. [API 엔드포인트](#api-엔드포인트)
5. [기능 설명](#기능-설명)
6. [제거 방법](#제거-방법)

---

## 🏗️ 시스템 구성

### 백엔드 (Spring Boot)
```
src/main/java/com/example/choprest/demo/
├── entity/          # 엔티티 (User, Reservation, Review)
├── repository/      # JPA Repository
├── service/         # 비즈니스 로직
├── controller/      # REST API 컨트롤러
└── dto/            # 데이터 전송 객체
```

### 데이터베이스 관계도
```
demo_users (사용자)
├── id (PK)
├── username, password, name, email, phone
├── role (ADMIN/OWNER/USER)
├── restaurant_id (FK) ─────┐
└── status                  │
                            │  @ManyToOne
                            ▼
                      restaurants (식당)
                      ├── id (PK)
                      ├── restaurant_name
                      └── ...

demo_reservations (예약)
├── id (PK)
├── user_id ─────> demo_users.id
├── restaurant_id ─> restaurants.id
├── reservation_date, reservation_time
├── status (PENDING/APPROVED/REJECTED/CANCELLED)
└── ...

demo_reviews (리뷰)
├── id (PK)
├── user_id ─────> demo_users.id
├── restaurant_id ─> restaurants.id
├── reservation_id ─> demo_reservations.id (선택)
├── rating (1-5)
└── ...
```

**핵심 관계:**
- 🔗 **User ↔ Restaurant**: 가게 주인(OWNER)은 `restaurant_id`로 식당과 연결
- 🔗 **Reservation**: `user_id`와 `restaurant_id`로 회원-식당 예약 관계
- 🔗 **Review**: 예약 완료 후 리뷰 작성 (reservation_id 선택적 연결)

### 프론트엔드 (React)
```
frontend/src/demo/
├── AuthContext.js       # 인증 상태 관리
├── api.js              # API 클라이언트
├── LoginPage.js        # 로그인/회원가입
├── DemoLayout.js       # 공통 레이아웃
├── ReservationsPage.js # 예약 관리
├── ReviewsPage.js      # 리뷰 관리
├── ProfilePage.js      # 프로필
└── AdminPage.js        # 관리자 대시보드
```

---

## 🚀 빠른 시작

### 1. 데이터베이스 준비

MySQL에서 테스트 데이터 생성:
```bash
mysql -u root -p choprest < demo-test-data-v2.sql
```

> 💡 **중요**: `demo-test-data-v2.sql` 사용 (JPA 관계 매핑 버전)

### 2. 백엔드 실행

```bash
# 프로젝트 빌드
gradlew.bat clean build

# 서버 실행
gradlew.bat bootRun
```

서버가 `http://localhost:8080` 에서 실행됩니다.

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm start
```

프론트엔드가 `http://localhost:3000` 에서 실행됩니다.

### 4. 데모 시스템 접속

1. 브라우저에서 http://localhost:3000/demo/login 접속
2. 아래 테스트 계정으로 로그인하거나 새 계정 생성
3. 예약/리뷰 기능 테스트

---

## 👥 테스트 계정

### 관리자 (ADMIN)
- **아이디**: admin
- **비밀번호**: admin123
- **권한**: 전체 시스템 관리, 사용자 관리, 신고 리뷰 관리

### 가게 주인 (OWNER)
- **아이디**: owner
- **비밀번호**: owner123
- **권한**: 자신의 식당 예약 승인/거절

회원가입 시 식당 ID 입력 필요 (예: 1, 2, 3...)

### 일반 회원 (USER)
- **아이디**: user
- **비밀번호**: user123
- **권한**: 예약하기, 리뷰 작성

> 💡 새 계정도 회원가입 페이지에서 즉시 생성 가능합니다!

---

## 🔌 API 엔드포인트

### 인증 API
```
POST /api/demo/auth/signup      # 회원가입
POST /api/demo/auth/login       # 로그인
```

### 예약 API
```
POST   /api/demo/reservations                    # 예약 생성
GET    /api/demo/reservations/user/{userId}      # 사용자 예약 조회
GET    /api/demo/reservations/restaurant/{id}    # 식당 예약 조회
GET    /api/demo/reservations/all                # 전체 예약 조회 (관리자)
PUT    /api/demo/reservations/{id}/approve       # 예약 승인
PUT    /api/demo/reservations/{id}/reject        # 예약 거절
PUT    /api/demo/reservations/{id}/cancel        # 예약 취소
```

### 리뷰 API
```
POST   /api/demo/reviews                         # 리뷰 작성
GET    /api/demo/reviews/restaurant/{id}         # 식당 리뷰 조회
GET    /api/demo/reviews/restaurant/{id}/stats   # 식당 리뷰 통계
GET    /api/demo/reviews/user/{userId}           # 사용자 리뷰 조회
PUT    /api/demo/reviews/{id}/like               # 리뷰 좋아요
PUT    /api/demo/reviews/{id}/dislike            # 리뷰 싫어요
PUT    /api/demo/reviews/{id}/report             # 리뷰 신고
GET    /api/demo/reviews/reported                # 신고된 리뷰 조회
```

### 관리자 API
```
GET    /api/demo/admin/users                     # 전체 사용자 조회
GET    /api/demo/admin/users/role/{role}         # 역할별 사용자 조회
PUT    /api/demo/admin/users/{id}/status         # 사용자 상태 변경
DELETE /api/demo/admin/users/{id}                # 사용자 삭제
```

---

## 🎯 기능 설명

### 1. 회원가입/로그인
- 역할 선택 (일반회원/가게주인/관리자)
- 가게 주인은 식당 ID 필수 입력
- 로컬 스토리지에 세션 저장

### 2. 예약 관리
- **일반 회원**: 예약 생성, 취소
- **가게 주인**: 자신의 식당 예약 승인/거절
- **관리자**: 모든 예약 조회
- **실시간 알림**: 5초마다 자동 새로고침 (실시간 알림 시뮬레이션)

### 3. 리뷰 시스템
- 식당별 리뷰 작성 및 조회
- 평점 1-5점 선택
- 좋아요/싫어요 기능
- 신고 기능 (관리자가 확인 가능)

### 4. 관리자 대시보드
- 전체 사용자 관리 (활성화/정지/삭제)
- 신고된 리뷰 확인
- 예약 통계 확인

### 5. 네비게이션
- 📱 모바일 하단 네비게이션 바
- 🖥️ 데스크탑 상단 헤더
- 역할별 메뉴 표시 (관리자는 관리자 메뉴 추가)

---

## 🗑️ 제거 방법

### 한 번에 모든 데모 코드 제거하기

#### 1. 백엔드 제거
```bash
# demo 패키지 전체 삭제
rm -rf src/main/java/com/example/choprest/demo
```

또는 Windows에서:
```cmd
rmdir /s /q src\main\java\com\example\choprest\demo
```

#### 2. 프론트엔드 제거
```bash
# demo 폴더 삭제
rm -rf frontend/src/demo
```

또는 Windows에서:
```cmd
rmdir /s /q frontend\src\demo
```

#### 3. App.js 수정

`frontend/src/App.js` 에서 아래 코드 제거:

```javascript
// 이 부분 삭제 ❌
import { AuthProvider, useAuth } from './demo/AuthContext';
import LoginPage from './demo/LoginPage';
import DemoLayout from './demo/DemoLayout';
import ReservationsPage from './demo/ReservationsPage';
import ReviewsPage from './demo/ReviewsPage';
import ProfilePage from './demo/ProfilePage';
import AdminPage from './demo/AdminPage';

// ProtectedRoute 컴포넌트 삭제 ❌

// AuthProvider 및 demo 라우트 삭제 ❌
```

원래 코드로 복원:
```javascript
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
      </Routes>
    </Router>
  );
}
```

#### 4. ReservationPage.js 수정

`frontend/src/ReservationPage.js` 에서 아래 코드 제거:

```javascript
// 이 부분 삭제 ❌
import { useAuth } from './demo/AuthContext';
import { reservationAPI } from './demo/api';

// const { user } = useAuth(); 삭제 ❌

// useState 초기값을 원래대로 ❌
const [reservationData, setReservationData] = useState({
  name: '',
  phone: '',
  email: '',
  // ...
});

// handleSubmit 함수를 원래 시뮬레이션 방식으로 복원 ❌
```

#### 5. 데이터베이스 테이블 제거 (선택사항)

MySQL에서 테스트 테이블 삭제:
```sql
DROP TABLE IF EXISTS demo_reviews;
DROP TABLE IF EXISTS demo_reservations;
DROP TABLE IF EXISTS demo_users;
```

#### 6. README 파일 제거
```bash
rm DEMO_README.md
```

---

## ⚠️ 주의사항

1. **보안**
   - 비밀번호가 평문으로 저장됩니다 (실제로는 BCrypt 등 암호화 필요)
   - 실제 JWT가 아닌 간단한 토큰 사용 (실제로는 JWT 사용)
   - CORS가 모두 열려있음 (실제로는 특정 도메인만 허용)

2. **성능**
   - 실시간 알림이 폴링 방식 (실제로는 WebSocket/SSE 권장)
   - 페이지네이션 없음 (대량 데이터 시 성능 이슈)

3. **데이터**
   - 테스트 데이터는 정기적으로 삭제 권장
   - 실제 운영 데이터와 분리 관리

---

## 📝 실제 운영 시 권장사항

### 인증 시스템
```
✅ Spring Security + JWT
✅ BCrypt 비밀번호 암호화
✅ Refresh Token
✅ HTTPS 필수
✅ CORS 제한
```

### 알림 시스템
```
✅ Firebase Cloud Messaging (FCM)
✅ WebSocket 또는 Server-Sent Events (SSE)
✅ SMS API (네이버 클라우드, 카카오 알림톡)
✅ 이메일 알림 (AWS SES, SendGrid)
```

### 추가 기능
```
✅ 이메일 인증
✅ 소셜 로그인 (Google, Kakao, Naver)
✅ 2단계 인증 (2FA)
✅ 비밀번호 찾기
✅ 프로필 수정
✅ 파일 업로드 (프로필 사진, 리뷰 사진)
```

---

## 🤝 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.

**Happy Testing! 🎉**

