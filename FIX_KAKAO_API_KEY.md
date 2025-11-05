# 🔧 Kakao API 키 401 에러 해결 가이드

## ❌ 현재 문제

```
401 Unauthorized from GET https://dapi.kakao.com/v2/local/search/keyword.json
```

이 에러는 **Kakao API 키가 유효하지 않거나 만료**되었을 때 발생합니다.

---

## ✅ 해결 방법

### 방법 1: 새로운 Kakao API 키 발급 (권장)

1. **Kakao Developers 로그인**
   - https://developers.kakao.com 접속
   - 로그인

2. **내 애플리케이션 선택**
   - 대시보드에서 애플리케이션 선택

3. **REST API 키 확인/재발급**
   - 앱 설정 > 앱 키
   - REST API 키 확인
   - 필요시 재발급

4. **application.properties 업데이트**
   ```properties
   kakao.api.key=YOUR_NEW_API_KEY
   kakao.api.key1=YOUR_NEW_API_KEY_1
   kakao.api.key2=YOUR_NEW_API_KEY_2
   kakao.api.key3=YOUR_NEW_API_KEY_3
   ```

5. **백엔드 재시작**
   ```bash
   # 기존 프로세스 종료 후
   gradlew.bat bootRun
   ```

---

### 방법 2: 기존 API 키 확인

1. **API 키 권한 확인**
   - Kakao Developers > 내 애플리케이션
   - 제품 설정 > Kakao 로그인 활성화
   - 앱 설정 > 플랫폼 설정에서 올바른 플랫폼 설정

2. **API 사용량 확인**
   - 일일 사용량 초과 여부 확인
   - 무료 플랜: 일일 300,000건

3. **키 복사 확인**
   - API 키가 올바르게 복사되었는지 확인
   - 앞뒤 공백 없이 정확히 입력

---

### 방법 3: API 키 설정 확인

현재 `application.properties` 설정:

```properties
# Kakao API Configuration
kakao.api.key=YOUR_API_KEY
kakao.api.key1=YOUR_API_KEY_1
kakao.api.key2=YOUR_API_KEY_2
kakao.api.key3=YOUR_API_KEY_3
```

**모든 키를 동일한 유효한 키로 설정**하거나, **각각 다른 유효한 키**를 설정하세요.

---

## 🔍 문제 진단

### 1. API 키 테스트

```bash
# 프록시 API로 테스트
curl "http://localhost:8080/api/restaurants/kakao/search?query=맥도날드"
```

**성공 응답:**
```json
{
  "documents": [...]
}
```

**에러 응답:**
```json
{
  "error": "401 Unauthorized"
}
```

### 2. 백엔드 로그 확인

```
[WARN] Error searching with query '...': 401 Unauthorized
```

이 로그가 보이면 API 키 문제입니다.

---

## 📝 체크리스트

- [ ] Kakao Developers에 로그인 가능
- [ ] 애플리케이션이 활성화되어 있음
- [ ] REST API 키가 올바르게 복사됨
- [ ] `application.properties`에 키가 올바르게 설정됨
- [ ] 백엔드를 재시작했음
- [ ] API 사용량 한도를 초과하지 않았음

---

## ⚠️ 주의사항

1. **API 키 공개 금지**
   - `application.properties`를 Git에 커밋하지 마세요
   - `.gitignore`에 추가 권장

2. **사용량 제한**
   - 무료: 일일 300,000건
   - 초과 시 추가 과금 또는 다음날까지 대기

3. **키 로테이션**
   - 여러 키를 사용하면 더 많은 요청 처리 가능
   - 각 키는 독립적인 사용량 제한

---

## 🎯 빠른 해결

**가장 빠른 방법:**

1. `application.properties` 열기
2. `kakao.api.key` 값을 올바른 REST API 키로 변경
3. 백엔드 재시작
4. 테스트: `curl "http://localhost:8080/api/restaurants/kakao/search?query=맥도날드"`

---

## 📞 추가 도움

- Kakao Developers 문서: https://developers.kakao.com/docs
- API 키 발급: https://developers.kakao.com/console/app





