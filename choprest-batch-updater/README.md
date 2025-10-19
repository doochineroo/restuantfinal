# ChopRest Batch Location Updater

이 프로젝트는 ChopRest 애플리케이션의 모든 식당에 대한 위치 정보(lat, lng, roadAddress)를 일괄 수집하는 배치 작업 도구입니다.

## 🚀 주요 기능

- **API 로테이션**: 3개의 Kakao API 키를 순환 사용하여 429 에러 방지
- **레이트 리미팅**: 1초당 1-2개 요청으로 안전한 API 호출
- **재시도 로직**: 실패 시 자동 재시도 (최대 3회)
- **진행 상황 추적**: 실시간 진행 상황 모니터링
- **데이터 검증**: 수집된 데이터의 유효성 검사

## 📋 사전 준비

1. **API 키 설정**: `src/main/resources/application.properties`에서 3개의 Kakao API 키 설정
   ```properties
   kakao.api.key1=YOUR_FIRST_API_KEY
   kakao.api.key2=YOUR_SECOND_API_KEY  
   kakao.api.key3=YOUR_THIRD_API_KEY
   ```

2. **데이터베이스 연결**: 기존 ChopRest 프로젝트와 동일한 MySQL 데이터베이스 사용

## 🏃‍♂️ 실행 방법

### Windows
```bash
run-batch.bat
```

### 수동 실행
```bash
./gradlew build
./gradlew bootRun
```

## 📊 API 엔드포인트

애플리케이션 실행 후 `http://localhost:8081`에서 다음 API 사용 가능:

### 1. 전체 위치 정보 업데이트 시작
```bash
POST /api/batch/update-locations
```

### 2. 현재 상태 조회
```bash
GET /api/batch/status
```

### 3. 위치 정보가 없는 식당 목록
```bash
GET /api/batch/restaurants-without-location?page=0&size=50
```

### 4. 위치 정보가 있는 식당 목록
```bash
GET /api/batch/restaurants-with-location?page=0&size=50
```

### 5. 특정 식당 위치 정보 업데이트
```bash
POST /api/batch/update-restaurant/{id}
```

## ⚙️ 설정 옵션

`application.properties`에서 다음 설정 조정 가능:

```properties
# 레이트 리미팅
batch.rate-limit.delay-ms=1000                    # 요청 간 지연 시간 (ms)
batch.rate-limit.max-requests-per-minute=30       # 분당 최대 요청 수

# 재시도 설정
batch.max-retries=3                              # 최대 재시도 횟수
batch.retry-delay-ms=5000                        # 재시도 간 지연 시간 (ms)

# 배치 설정
batch.batch-size=50                              # 배치 크기
```

## 📈 사용 예시

### 1. 상태 확인
```bash
curl http://localhost:8081/api/batch/status
```

### 2. 배치 작업 시작
```bash
curl -X POST http://localhost:8081/api/batch/update-locations
```

### 3. 진행 상황 모니터링
```bash
# 터미널에서 로그 확인
tail -f logs/application.log
```

## 🔧 문제 해결

### 429 에러 발생 시
- API 키 로테이션이 자동으로 작동
- 1분 대기 후 자동 재시도
- 3개 API 키를 모두 사용하여 부하 분산

### 메모리 부족 시
- `batch.batch-size` 값을 줄여서 배치 크기 감소
- JVM 힙 크기 증가: `-Xmx2g`

### 데이터베이스 연결 오류 시
- `application.properties`의 데이터베이스 설정 확인
- 네트워크 연결 상태 확인

## 📝 로그 확인

애플리케이션 실행 중 다음 정보를 로그에서 확인할 수 있습니다:

- API 키 로테이션 상태
- 요청 성공/실패 통계
- 429 에러 발생 시 자동 재시도
- 진행 상황 (10개마다)

## 🎯 완료 후 작업

배치 작업 완료 후:

1. **데이터 검증**: 위치 정보가 올바르게 수집되었는지 확인
2. **메인 프로젝트 적용**: 수집된 데이터를 메인 ChopRest 프로젝트에 반영
3. **성능 테스트**: 위치 기반 검색 기능 테스트

## ⚠️ 주의사항

- API 키 사용량 모니터링 필요
- 대용량 데이터 처리 시 충분한 시간 확보
- 네트워크 연결이 안정적인 환경에서 실행
- 데이터베이스 백업 권장
