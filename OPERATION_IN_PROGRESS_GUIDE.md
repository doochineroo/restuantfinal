# ⚠️ Cloud SQL 작업 진행 중 해결 가이드

## ❌ 에러 메시지

```
ERROR: (gcloud.sql.instances.patch) HTTPError 409: 
Operation failed because another operation was already in progress. 
Try your request after the current operation is complete.
```

## 🔍 문제 원인

**다른 작업이 이미 진행 중**이어서 새로운 작업을 수행할 수 없습니다.

## ✅ 해결 방법

### 방법 1: 진행 중인 작업 확인 (권장)

```bash
check-active-operations.bat
```

이 스크립트는:
1. 진행 중인 작업 확인
2. 작업 상태 확인
3. 작업 완료까지 자동 대기

### 방법 2: 수동 확인

**작업 목록 확인:**
```bash
gcloud sql operations list --instance=chopplan-db --limit=5
```

**작업 상세 확인:**
```bash
gcloud sql operations describe [OPERATION_ID] --instance=chopplan-db
```

### 방법 3: 작업 취소 시도 (권장하지 않음)

⚠️ **주의: 인스턴스가 손상될 수 있습니다!**

```bash
cancel-cloudsql-operation.bat
```

또는 수동:
```bash
# 작업 ID 확인
gcloud sql operations list --instance=chopplan-db --limit=1 --format="value(name)"

# 작업 취소
gcloud sql operations cancel [OPERATION_ID] --instance=chopplan-db
```

## 📊 작업 상태

### 가능한 상태

- **RUNNABLE**: 정상 실행 중
- **PENDING**: 작업 대기 중
- **RUNNING**: 작업 진행 중
- **DONE**: 작업 완료
- **ERROR**: 작업 실패

### 작업 유형

- **CREATE**: 인스턴스 생성
- **UPDATE**: 인스턴스 업데이트
- **PATCH**: 설정 변경
- **DELETE**: 인스턴스 삭제
- **BACKUP**: 백업 작업

## ⏰ 예상 소요 시간

| 작업 유형 | 예상 시간 |
|---|---|
| 티어 변경 | 5-10분 |
| 설정 변경 | 2-5분 |
| 인스턴스 생성 | 5-10분 |
| 백업 | 10-30분 |

## 🚀 빠른 해결

### 1단계: 진행 중인 작업 확인

```bash
check-active-operations.bat
```

### 2단계: 작업 완료 대기

스크립트에서 자동 대기 옵션 선택 (Y)

또는 수동:
```bash
wait-for-cloudsql-ready.bat
```

### 3단계: 작업 완료 후 다시 시도

```bash
# db-f1-micro로 변경
gcloud sql instances patch chopplan-db --tier=db-f1-micro

# 또는 삭제
gcloud sql instances delete chopplan-db
```

## 💡 작업 모니터링

### 자동 모니터링

```bash
# 30초마다 상태 확인
check-active-operations.bat
# Y 선택
```

### 수동 모니터링

```bash
# 작업 목록 지속 확인
gcloud sql operations list --instance=chopplan-db --limit=1
```

## ⚠️ 주의사항

### 작업 취소 시

- ❌ 데이터 손실 가능
- ❌ 인스턴스 손상 가능
- ❌ 복구 불가능할 수 있음

### 권장 사항

- ✅ 작업 완료 대기 (가장 안전)
- ✅ 작업 상태 모니터링
- ✅ 완료 후 작업 수행

## 🔧 문제 해결

### 작업이 너무 오래 걸리는 경우

1. **작업 상태 확인**
   ```bash
   gcloud sql operations list --instance=chopplan-db
   ```

2. **에러 확인**
   ```bash
   gcloud sql operations describe [OPERATION_ID] --instance=chopplan-db
   ```

3. **Google Cloud Console 확인**
   - Cloud SQL > 인스턴스 > 작업 탭
   - 에러 메시지 확인

### 작업이 실패한 경우

1. **에러 메시지 확인**
   ```bash
   gcloud sql operations list --instance=chopplan-db --format="table(operationType,status,error)"
   ```

2. **인스턴스 상태 확인**
   ```bash
   gcloud sql instances describe chopplan-db
   ```

3. **다시 시도**
   - 작업 실패 시 인스턴스는 이전 상태로 복구
   - 다시 작업 시도 가능

## 📝 체크리스트

작업 진행 중일 때:

- [ ] 진행 중인 작업 확인 (`check-active-operations.bat`)
- [ ] 작업 상태 확인
- [ ] 작업 완료 대기
- [ ] 완료 후 원하는 작업 실행

## 🎯 결론

**현재 상황:**
- 다른 작업이 진행 중
- 새로운 작업 불가

**해결 방법:**
1. 진행 중인 작업 확인 (`check-active-operations.bat`)
2. 작업 완료 대기 (5-10분)
3. 완료 후 다시 시도

**주의:**
- 강제 취소는 권장하지 않음
- 작업 완료까지 기다리는 것이 안전

