# BottomNav 컴포넌트

공통 하단 네비게이션 바 컴포넌트입니다.

## 기능

### 비로그인 사용자
- 🏠 홈
- 👤 로그인

### 로그인 사용자
- 🏠 홈
- 📅 예약확인
- ✍️ 리뷰쓰기
- 👤 프로필

### 관리자
- 위 메뉴 + ⚙️ 관리자

## 적용된 페이지

- ✅ MainPage (메인 페이지)
- ✅ ReservationPage (예약 페이지)
- ✅ DemoLayout (Demo 레이아웃 - 예약확인, 리뷰쓰기, 프로필, 관리자)
- ❌ LoginPage (제외)

## 반응형

- 📱 모바일: 하단 고정 네비게이션
- 🖥️ 데스크탑 (769px 이상): 숨김

## 사용법

```jsx
import BottomNav from './components/BottomNav';

function YourPage() {
  return (
    <div>
      {/* 페이지 콘텐츠 */}
      
      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
```

## 스타일

- `z-index: 999` - 다른 요소 위에 표시
- `position: fixed` - 스크롤해도 고정
- `bottom: 0` - 화면 하단에 배치


