# ✅ API 키 업데이트 완료

## 🔧 수정 내용

### 1. application.properties 업데이트
새로운 3개의 Kakao REST API 키로 업데이트:
```properties
kakao.api.key=363d03dddf733d17f5b3edb9be1e8911
kakao.api.key1=363d03dddf733d17f5b3edb9be1e8911
kakao.api.key2=5d1502f95e6ae410f5ce45abf596d639
kakao.api.key3=674451cc66e051ddfca840a7f734213c
```

### 2. RestaurantController 기본값 업데이트
생성자의 기본 API 키를 새 키로 변경했습니다.

---

## 🔍 이전 버전(c3b13bf)과의 차이점

### 이전 버전 (잘 작동했던 버전):
- **하드코딩된 단일 API 키**: `"KakaoAK 0daaba62d376e0a4633352753a28827c"`
- **딜레이**: 100ms
- **간단한 구조**

### 현재 버전:
- **API 키 로테이션**: 3개의 키를 순환 사용 (429 에러 방지)
- **딜레이**: 500ms (더 안전)
- **application.properties에서 읽어오기**

---

## 🚀 다음 단계

### 1. 백엔드 재시작
```bash
# 기존 프로세스 종료 (Ctrl+C) 후
gradlew.bat bootRun
```

### 2. 테스트
```bash
# 프록시 API 테스트
curl "http://localhost:8080/api/restaurants/kakao/search?query=맥도날드"

# 식당 검색 (자동 좌표 업데이트)
curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"
```

### 3. 배치 업데이트 (선택사항)
```bash
curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1500"
```

---

## ✅ 성공 확인

백엔드 로그에서 다음 메시지 확인:
```
Initialized with 3 Kakao API keys
✅ Updated coordinates for ...: lat=..., lng=..., address=...
```

**에러가 없고** lat, lng 값이 정상적으로 반환되면 성공입니다!

---

## ⚠️ 여전히 401 에러가 발생하는 경우

1. **API 키 확인**:
   - Kakao Developers에서 REST API 키가 활성화되어 있는지 확인
   - 플랫폼 설정이 올바른지 확인

2. **로그 확인**:
   - 백엔드 로그에서 실제 사용된 API 키 확인
   - `Initialized with 3 Kakao API keys` 메시지 확인

3. **수동 테스트**:
   ```bash
   curl -H "Authorization: KakaoAK 363d03dddf733d17f5b3edb9be1e8911" \
        "https://dapi.kakao.com/v2/local/search/keyword.json?query=맥도날드&category_group_code=FD6"
   ```





