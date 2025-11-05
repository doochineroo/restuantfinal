# ✅ Cloud SQL 티어 변경 확인 방법

## 🚀 빠른 확인

### 방법 1: 자동 스크립트 (권장)

```bash
check-cloudsql-tier.bat
```

이 스크립트는:
- 현재 티어 확인
- 비용 정보 표시
- 변경 여부 확인

### 방법 2: gcloud CLI 명령어

**티어만 확인:**
```bash
gcloud sql instances describe chopplan-db --format="value(settings.tier)"
```

**결과:**
- `db-f1-micro` → 변경 완료 ✅
- `db-n1-standard-1` → 아직 변경 안 됨 ⚠️

**전체 정보 확인:**
```bash
gcloud sql instances describe chopplan-db --format="table(name,settings.tier,region,state)"
```

**결과 예시:**
```
NAME         TIER             REGION       STATE
chopplan-db  db-f1-micro      us-central1  RUNNABLE
```

## 📊 티어 확인 결과

### ✅ 변경 완료 (db-f1-micro)

```
현재 티어: db-f1-micro
월 비용: 약 13,000-20,000원
✅ 비용 절감 완료!
```

### ⚠️ 변경 안 됨 (db-n1-standard-1)

```
현재 티어: db-n1-standard-1
월 비용: 약 65,000-90,000원
💡 db-f1-micro로 변경 필요
```

## 🔍 상세 확인

### 인스턴스 전체 정보

```bash
gcloud sql instances describe chopplan-db
```

**주요 정보:**
- `settings.tier`: 현재 티어
- `state`: 인스턴스 상태
- `region`: 리전
- `databaseVersion`: MySQL 버전

### 인스턴스 목록

```bash
gcloud sql instances list --format="table(name,tier,region,state)"
```

## 💡 확인 시점

### 변경 후 확인

1. **변경 명령 실행 후**
   ```bash
   gcloud sql instances patch chopplan-db --tier=db-f1-micro
   ```

2. **작업 완료 대기** (5-10분)

3. **티어 확인**
   ```bash
   check-cloudsql-tier.bat
   ```

### 지속 모니터링

```bash
# 30초마다 확인
:LOOP
gcloud sql instances describe chopplan-db --format="value(settings.tier)"
timeout /t 30 /nobreak >nul
goto :LOOP
```

## 🎯 결과 해석

### db-f1-micro 확인됨

✅ **변경 완료!**
- 비용 절감 성공
- 월 약 50,000-70,000원 절감
- 다음 달부터 반영

### db-n1-standard-1 확인됨

⚠️ **변경 안 됨**
- 작업이 아직 진행 중일 수 있음
- 또는 작업 실패 가능
- 다시 시도 필요

## 📝 체크리스트

- [ ] 티어 확인 (`check-cloudsql-tier.bat`)
- [ ] db-f1-micro 확인
- [ ] 인스턴스 상태 확인 (RUNNABLE)
- [ ] 비용 절감 확인

## 🚀 빠른 명령어

```bash
# 티어 확인
check-cloudsql-tier.bat

# 또는 간단히
gcloud sql instances describe chopplan-db --format="value(settings.tier)"
```

