# ⏳ Cloud SQL 업데이트 중 해결 가이드

## ❌ 현재 상황

**"업데이트 중"이라고 나오고 삭제/수정이 안 되는 상황**

이는 Cloud SQL 인스턴스가 **업데이트 작업 중**이어서 다른 작업이 불가능한 상태입니다.

## 🔍 상태 확인

### 현재 상태 확인

```bash
check-cloudsql-status.bat
```

또는 수동:
```bash
gcloud sql instances describe chopplan-db --format="value(state)"
```

### 가능한 상태

- **RUNNABLE**: 정상 실행 중 (삭제/수정 가능)
- **PENDING_UPDATE**: 업데이트 대기 중 (작업 불가)
- **PENDING_CREATE**: 생성 중 (작업 불가)
- **MAINTENANCE**: 유지보수 중 (작업 불가)

## ⏰ 해결 방법

### 방법 1: 업데이트 완료 대기 (권장)

**업데이트는 보통 5-10분 소요됩니다.**

**자동 대기 스크립트:**
```bash
wait-for-cloudsql-ready.bat
```

이 스크립트는 30초마다 상태를 확인하고, 준비되면 알려줍니다.

**수동 확인:**
```bash
# 상태 확인
gcloud sql instances describe chopplan-db --format="value(state)"

# RUNNABLE이 나올 때까지 기다리기
```

### 방법 2: 작업 내역 확인

**최근 작업 확인:**
```bash
gcloud sql operations list --instance=chopplan-db --limit=5
```

**특정 작업 확인:**
```bash
gcloud sql operations describe [OPERATION_ID] --instance=chopplan-db
```

### 방법 3: 강제 취소 (권장하지 않음)

⚠️ **주의: 인스턴스가 손상될 수 있습니다!**

```bash
# 작업 ID 확인
gcloud sql operations list --instance=chopplan-db --limit=1

# 작업 취소 (가능한 경우)
gcloud sql operations cancel [OPERATION_ID] --instance=chopplan-db
```

## 🚀 빠른 해결

### 1단계: 상태 확인

```bash
check-cloudsql-status.bat
```

### 2단계: 준비될 때까지 대기

```bash
wait-for-cloudsql-ready.bat
```

### 3단계: 준비되면 삭제/수정

```bash
# 삭제
gcloud sql instances delete chopplan-db

# 또는 수정
gcloud sql instances patch chopplan-db --tier=db-f1-micro
```

## 📊 예상 소요 시간

| 작업 | 예상 시간 |
|---|---|
| 티어 변경 | 5-10분 |
| 인스턴스 생성 | 5-10분 |
| 설정 변경 | 2-5분 |
| 백업 복원 | 10-30분 |

## ⚠️ 주의사항

### 업데이트 중에는 불가능한 작업

- ❌ 인스턴스 삭제
- ❌ 인스턴스 수정
- ❌ 데이터베이스 생성/삭제
- ❌ 설정 변경

### 업데이트 중에도 가능한 작업

- ✅ 데이터베이스 연결 (기존 연결 유지)
- ✅ 데이터 조회
- ✅ 상태 확인

## 💡 팁

### 1. 업데이트 시작 전 확인

```bash
# 현재 작업 확인
gcloud sql operations list --instance=chopplan-db --limit=1
```

### 2. 업데이트 중 모니터링

```bash
# 자동 상태 확인
check-cloudsql-status.bat
# 옵션 Y 선택
```

### 3. 업데이트 완료 알림

```bash
# 자동 대기
wait-for-cloudsql-ready.bat
```

## 🔧 문제 해결

### 업데이트가 너무 오래 걸리는 경우

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

### 업데이트 실패한 경우

1. **인스턴스 상태 확인**
   ```bash
   gcloud sql instances describe chopplan-db
   ```

2. **다시 시도**
   - 업데이트가 실패하면 인스턴스는 이전 상태로 돌아갑니다
   - 다시 업데이트 시도 가능

## 📝 체크리스트

업데이트 중일 때:

- [ ] 현재 상태 확인 (`check-cloudsql-status.bat`)
- [ ] 작업 내역 확인
- [ ] 업데이트 완료 대기
- [ ] 준비되면 원하는 작업 실행

## 🎯 결론

**현재 상황:**
- 인스턴스가 업데이트 중
- 삭제/수정 불가

**해결 방법:**
1. 업데이트 완료 대기 (5-10분)
2. `wait-for-cloudsql-ready.bat` 실행
3. 준비되면 삭제/수정

**주의:**
- 강제 취소는 권장하지 않음
- 업데이트가 완료될 때까지 기다리는 것이 안전

