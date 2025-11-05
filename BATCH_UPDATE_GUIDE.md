# 🚀 배치 좌표 업데이트 가이드 (429 에러 방지)

## 📋 개요

좌표가 없는 모든 식당의 좌표를 한번에 업데이트하는 기능입니다.
429 에러(Too Many Requests)를 방지하기 위한 다양한 안전 장치가 포함되어 있습니다.

## ✨ 주요 기능

1. **API 키 로테이션**: 3개의 Kakao API 키를 순환 사용
2. **적절한 딜레이**: 요청 사이에 1.5초 딜레이 (조정 가능)
3. **429 에러 재시도**: 429 에러 발생 시 30초 대기 후 재시도 (최대 3회)
4. **진행 상황 로깅**: 10개마다 진행 상황 출력
5. **에러 처리**: 실패한 항목 추적 및 보고

---

## 🏃 실행 방법

### 방법 1: 배치 스크립트 사용 (추천)

```bash
batch-update-coordinates.bat
```

### 방법 2: 직접 API 호출

```bash
# 기본 딜레이 (1.5초)
curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates"

# 딜레이 조정 (2초)
curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=2000"

# 빠른 업데이트 (1초, 권장하지 않음 - 429 에러 위험)
curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1000"
```

### 방법 3: 브라우저에서 POST 요청

Postman이나 다른 REST 클라이언트 사용:
```
POST http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=1500
```

---

## 📊 응답 예시

```json
{
  "message": "배치 좌표 업데이트 완료",
  "total": 150,
  "success": 120,
  "failed": 10,
  "skipped": 20
}
```

**응답 필드:**
- `total`: 좌표가 없던 식당 총 개수
- `success`: 성공적으로 업데이트된 개수
- `failed`: 업데이트 실패 개수
- `skipped`: 이미 좌표가 있어서 스킵된 개수

---

## ⚙️ 429 에러 방지 메커니즘

### 1. API 키 로테이션

```java
// 3개의 API 키를 순환 사용
private final String[] KAKAO_API_KEYS = {
    "API_KEY_1",
    "API_KEY_2", 
    "API_KEY_3"
};
```

### 2. 기본 딜레이

- **기본값**: 1500ms (1.5초)
- 각 요청 사이에 자동 대기
- API 호출 제한 방지

### 3. 429 에러 감지 및 재시도

```java
// 429 에러 발생 시:
1. 30초 대기
2. 다음 API 키로 전환
3. 최대 3회 재시도
```

### 4. 점진적 딜레이

- 실패 시 딜레이 시간 점진적 증가
- 재시도 횟수에 따라 대기 시간 증가

---

## 📝 로그 예시

```
[INFO] Batch coordinate update started with delay: 1500ms
[INFO] Found 150 restaurants without coordinates. Starting batch update...
[INFO] Processing 1/150: 맥도날드 강남점
[INFO] ✅ Successfully updated 1/150: 맥도날드 강남점
[INFO] Processing 2/150: 버거킹 역삼점
[INFO] ✅ Successfully updated 2/150: 버거킹 역삼점
...
[INFO] 📊 Progress: 10/150 (Success: 8, Failed: 1, Skipped: 1)
...
[WARN] ⚠️ 429 Too Many Requests error for 식당명 (attempt 1/3). Waiting 30 seconds...
[INFO] Switched to next API key. Retrying...
...
[INFO] ✅ Batch update completed. Total: 150, Success: 120, Failed: 10, Skipped: 20
```

---

## 🎯 사용 시나리오

### 시나리오 1: 처음 데이터 로드 후

```bash
# 1. CSV 데이터 로드
# 2. 좌표가 없는 식당들 확인
curl "http://localhost:8080/api/restaurants/statistics/coordinates"

# 3. 배치 업데이트 실행
curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates"

# 4. 결과 확인
curl "http://localhost:8080/api/restaurants/statistics/coordinates"
```

### 시나리오 2: 주기적 업데이트

```bash
# 매일 밤 자동 실행하도록 스케줄링 가능
# (Windows Task Scheduler 또는 cron 사용)
```

---

## ⚠️ 주의사항

1. **시간 소요**: 많은 식당의 경우 시간이 오래 걸릴 수 있습니다
   - 예: 100개 식당 = 약 2.5분 (1.5초 딜레이 기준)

2. **429 에러 발생 시**: 
   - 자동으로 30초 대기 후 재시도
   - API 키 자동 전환
   - 최대 3회 재시도

3. **백엔드 로그 확인**: 
   - 진행 상황을 실시간으로 확인하려면 백엔드 콘솔 로그를 봐야 합니다

4. **데이터베이스 백업**: 
   - 대량 업데이트 전에 데이터베이스 백업 권장

---

## 🔍 문제 해결

### 429 에러가 계속 발생하는 경우

```bash
# 딜레이를 더 늘려서 실행
curl -X POST "http://localhost:8080/api/restaurants/batch-update-coordinates?delayMs=3000"
```

### 업데이트가 중간에 멈춘 경우

- 백엔드 로그 확인
- 네트워크 연결 확인
- MySQL 서버 상태 확인
- 필요시 다시 실행 (이미 업데이트된 항목은 스킵됨)

### 특정 식당만 업데이트가 안 되는 경우

```bash
# 개별 식당 상세 조회 (자동으로 좌표 업데이트 시도)
curl "http://localhost:8080/api/restaurants/{id}"
```

---

## 📊 성능 최적화

### 딜레이 조정 가이드

| 상황 | 권장 딜레이 | 설명 |
|------|------------|------|
| 안정적인 업데이트 | 1500ms | 기본값, 권장 |
| 빠른 업데이트 (위험) | 1000ms | 429 에러 위험 있음 |
| 매우 안전한 업데이트 | 2000ms | 느리지만 안전 |
| 429 에러 발생 시 | 3000ms+ | 에러 후 사용 권장 |

---

## ✅ 체크리스트

배치 업데이트 전 확인사항:

- [ ] 백엔드가 실행 중인지 확인
- [ ] MySQL 서버가 실행 중인지 확인
- [ ] `chopplan` 데이터베이스 연결 확인
- [ ] Kakao API 키가 올바르게 설정되어 있는지 확인
- [ ] 현재 좌표 통계 확인
- [ ] 네트워크 연결 확인

---

## 🎉 완료 후 확인

```bash
# 1. 좌표 통계 확인
curl "http://localhost:8080/api/restaurants/statistics/coordinates"

# 2. DBeaver에서 직접 확인
# restaurants 테이블에서 lat, lng, road_address 컬럼 확인

# 3. 샘플 데이터 확인
curl "http://localhost:8080/api/restaurants/1"
```

---

## 📝 요약

**가장 간단한 실행:**

```bash
# 1. 백엔드 실행
gradlew.bat bootRun

# 2. 배치 업데이트 실행
batch-update-coordinates.bat

# 3. 백엔드 로그에서 진행 상황 확인
```

이것으로 끝! 🎉





