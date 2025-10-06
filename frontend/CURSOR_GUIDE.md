# 커스텀 커서 적용 가이드

## 커서 이미지 추가 방법

### 1. 커서 이미지 준비
- 커서 이미지를 준비합니다 (권장: PNG 파일, 32x32 픽셀)
- 예: `cursor.png`, `cursor-pointer.png` 등

### 2. 이미지 파일 위치
커서 이미지를 다음 폴더에 복사합니다:
```
frontend/public/cursor.png
frontend/public/cursor-pointer.png
```

### 3. CSS 적용

`frontend/src/App.css` 파일을 열고 다음 부분을 수정합니다:

```css
body {
  /* 기본 커서 */
  cursor: url('/cursor.png'), auto;
}

/* 클릭 가능한 요소에 다른 커서 */
button,
a,
.restaurant-card,
.filter-main-btn,
.filter-dropdown-btn {
  cursor: url('/cursor-pointer.png'), pointer;
}
```

### 4. 여러 커서 스타일 예제

```css
/* 기본 커서 */
body {
  cursor: url('/cursor.png') 0 0, auto;
}

/* 포인터 커서 (클릭 가능) */
button, a {
  cursor: url('/cursor-pointer.png') 8 8, pointer;
}

/* 텍스트 선택 커서 */
input, textarea {
  cursor: url('/cursor-text.png') 8 16, text;
}

/* 로딩 커서 */
.loading-spinner {
  cursor: url('/cursor-wait.png') 8 8, wait;
}
```

### 5. 커서 이미지 사이즈 권장사항
- **Windows**: 32x32 픽셀
- **Mac**: 32x32 픽셀 (Retina는 64x64)
- **핫스팟**: 커서의 클릭 포인트 위치 지정 (예: `8 8`)

### 6. 브라우저 호환성
- Chrome, Firefox, Safari, Edge 모두 지원
- 커서 이미지가 로드되지 않으면 기본 커서(auto, pointer 등)가 표시됩니다

### 7. 현재 설정된 커서 위치
- `frontend/src/App.css` - 19번째 줄 (주석 처리됨)
- `frontend/src/ReservationPage.css` - 커서 스타일 지정됨

### 예제 코드

```css
/* App.css */
body {
  /* 이 주석을 해제하고 커서 이미지 경로를 지정하세요 */
  cursor: url('/cursor.png') 0 0, auto;
}

/* 버튼, 링크 등 클릭 가능한 요소 */
button,
a,
.restaurant-card:hover,
.search-btn,
.filter-main-btn {
  cursor: url('/cursor-pointer.png') 8 8, pointer;
}
```

## 무료 커서 이미지 리소스
- [Cursor.cc](https://www.cursor.cc/)
- [RealWorld Cursors](http://www.rw-designer.com/cursor-library)
- [Open Cursor Library](https://www.openclipart.org/)

