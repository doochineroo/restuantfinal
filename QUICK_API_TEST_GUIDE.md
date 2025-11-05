# 🚀 API 테스트 빠른 가이드

## ❌ 문제: PowerShell에서 400 에러 발생

```
curl : 원격 서버에서 (400) 잘못된 요청 오류를 반환했습니다.
```

**원인:** 한글 검색어가 URL 인코딩되지 않아서 발생

---

## ✅ 해결 방법 (3가지)

### 방법 1: 브라우저 사용 (가장 쉬움) ⭐ 추천

**브라우저 주소창에 직접 입력:**
```
http://localhost:8080/api/restaurants/search?keyword=맥도날드
```

**장점:**
- 한글 그대로 사용 가능
- JSON이 예쁘게 표시됨
- 가장 간단함

---

### 방법 2: URL 인코딩 사용

**PowerShell:**
```powershell
# URL 인코딩된 검색어 사용
curl "http://localhost:8080/api/restaurants/search?keyword=%EB%A7%A5%EB%8F%84%EB%82%A0%EB%93%9C"
```

**CMD:**
```cmd
curl "http://localhost:8080/api/restaurants/search?keyword=%EB%A7%A5%EB%8F%84%EB%82%A0%EB%93%9C"
```

**URL 인코딩 참고:**
- 맥도날드 = `%EB%A7%A5%EB%8F%84%EB%82%A0%EB%93%9C`
- 온라인 URL 인코딩 도구 사용 가능

---

### 방법 3: PowerShell 스크립트 사용

**만든 스크립트 실행:**
```powershell
.\test-search-powershell.ps1
```

이 스크립트는 자동으로 URL 인코딩을 처리합니다.

---

## 📝 다른 검색어 테스트

### 브라우저에서 (한글 그대로):
```
http://localhost:8080/api/restaurants/search?keyword=버거킹
http://localhost:8080/api/restaurants/search?keyword=강남
http://localhost:8080/api/restaurants/search?keyword=피자
```

### PowerShell에서 (URL 인코딩 필요):
- 버거킹: `%EB%B2%84%EA%B1%B0%ED%82%B9`
- 강남: `%EA%B0%95%EB%82%A8`
- 피자: `%ED%94%BC%EC%9E%90`

---

## 🔍 응답 확인

### 성공 응답 예시:
```json
[
  {
    "id": 1,
    "restaurantName": "맥도날드 강남점",
    "lat": 37.4979,
    "lng": 127.0276,
    "roadAddress": "서울특별시 강남구..."
  }
]
```

### 확인 사항:
- `lat`, `lng` 값이 있는지
- `roadAddress`가 채워져 있는지
- 백엔드 로그에 `✅ Updated coordinates` 메시지가 있는지

---

## 💡 추천

**가장 쉬운 방법:**
1. 브라우저 열기
2. 주소창에 입력: `http://localhost:8080/api/restaurants/search?keyword=맥도날드`
3. Enter

끝! 🎉





