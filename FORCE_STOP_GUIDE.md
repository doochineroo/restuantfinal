# ⚠️ Cloud SQL 강제 종료 가이드

## ⚠️ 주의사항

**강제 종료는 매우 위험합니다!**

- ❌ 인스턴스 손상 가능
- ❌ 데이터 손실 가능
- ❌ 복구 불가능할 수 있음
- ❌ 작업 취소가 실패할 수 있음

**권장: 작업 완료를 기다리는 것이 안전합니다.**

## 🚨 강제 종료 방법

### 방법 1: 작업 취소 시도

**성공 가능성: 낮음** (대부분의 작업은 취소 불가)

```bash
force-stop-cloudsql.bat
```

또는 수동:
```bash
# 작업 ID 확인
gcloud sql operations list --instance=chopplan-db --limit=1 --format="value(name)"

# 작업 취소 시도
gcloud sql operations cancel [OPERATION_ID] --instance=chopplan-db
```

**결과:**
- ✅ 성공: 작업 취소, 인스턴스 상태 확인 필요
- ❌ 실패: 취소 불가능한 작업 (대부분의 경우)

### 방법 2: 인스턴스 삭제 (가장 확실하지만 위험)

**⚠️ 데이터 영구 삭제!**

```bash
force-stop-cloudsql.bat
```

옵션 2 선택 후 인스턴스 삭제

또는 수동:
```bash
# 백업 필수!
gcloud sql instances delete chopplan-db --quiet
```

**주의:**
- 모든 데이터가 삭제됩니다
- 백업이 없으면 복구 불가능
- 삭제 후 새로 생성해야 함

## 📊 방법 비교

| 방법 | 성공 가능성 | 위험도 | 데이터 손실 |
|---|---|---|---|
| 작업 취소 | 낮음 | 중간 | 가능 |
| 인스턴스 삭제 | 높음 | 높음 | 확실 |

## 💡 안전한 대안

### 방법 1: 작업 완료 대기 (권장)

**가장 안전한 방법**

```bash
check-active-operations.bat
```

자동 대기 옵션 선택 (Y)

### 방법 2: 다른 작업 수행

- 작업이 완료될 때까지 기다리기
- 보통 5-10분 소요
- 안전하고 확실함

## 🔧 강제 종료 후 복구

### 작업 취소 성공 시

1. **인스턴스 상태 확인**
   ```bash
   gcloud sql instances describe chopplan-db
   ```

2. **에러 확인**
   ```bash
   gcloud sql operations list --instance=chopplan-db
   ```

3. **필요 시 복구**
   - 인스턴스가 손상되었을 수 있음
   - 백업에서 복원 필요

### 인스턴스 삭제 후

1. **새 인스턴스 생성**
   ```bash
   setup-cloud-sql-cli.bat
   ```

2. **데이터 복원** (백업이 있다면)
   ```bash
   # 백업 파일에서 복원
   gcloud sql import sql chopplan-db gs://[BUCKET]/backup.sql --database=chopplan
   ```

## ⚠️ 위험 시나리오

### 시나리오 1: 작업 취소 실패

- 작업이 취소 불가능한 상태
- 강제 종료 불가
- **결론: 작업 완료 대기만 가능**

### 시나리오 2: 인스턴스 손상

- 작업 취소 후 인스턴스가 손상됨
- 데이터 접근 불가
- **해결: 백업에서 복원**

### 시나리오 3: 데이터 손실

- 인스턴스 삭제 후 백업 없음
- 데이터 복구 불가능
- **예방: 백업 필수**

## 📝 체크리스트

강제 종료 전:

- [ ] 백업이 있는지 확인
- [ ] 데이터 복구 방법 확인
- [ ] 위험성 이해
- [ ] 최종 확인

강제 종료 후:

- [ ] 인스턴스 상태 확인
- [ ] 데이터 무결성 확인
- [ ] 필요 시 복원

## 🎯 결론

### 권장 방법

1. **작업 완료 대기** (가장 안전)
   ```bash
   check-active-operations.bat
   ```

2. **작업 취소 시도** (성공 가능성 낮음)
   ```bash
   force-stop-cloudsql.bat
   ```

3. **인스턴스 삭제** (마지막 수단, 위험)
   ```bash
   force-stop-cloudsql.bat
   ```

### 주의사항

- ⚠️ 강제 종료는 위험합니다
- ⚠️ 데이터 백업 필수
- ⚠️ 복구 방법 준비
- ✅ 작업 대기가 가장 안전

## 💡 팁

### 작업이 너무 오래 걸릴 때

1. **작업 상태 확인**
   - 정상 진행 중인지 확인
   - 에러가 있는지 확인

2. **Google Cloud Console 확인**
   - 작업 탭에서 상세 확인
   - 에러 메시지 확인

3. **고객 지원 문의**
   - 작업이 30분 이상 걸리면
   - Google Cloud 지원팀 문의

## 🚀 빠른 명령어

```bash
# 강제 종료 시도
force-stop-cloudsql.bat

# 또는 작업 확인 및 대기 (권장)
check-active-operations.bat
```

