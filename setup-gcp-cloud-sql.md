# 🚀 Google Cloud SQL 빠른 설정 가이드

## 📋 단계별 가이드

### Step 1: Google Cloud 계정 생성 및 프로젝트 생성

1. https://console.cloud.google.com 접속
2. 계정 생성 (무료 크레딧 $300 받기)
3. 프로젝트 생성:
   - 프로젝트 이름: `chopplan-project`
   - 프로젝트 ID: 자동 생성

### Step 2: Cloud SQL 인스턴스 생성

1. **네비게이션 메뉴** > **SQL** 클릭
2. **인스턴스 만들기** 클릭
3. **MySQL** 선택
4. 설정 입력:
   ```
   인스턴스 ID: chopplan-db
   비밀번호: [안전한 비밀번호 설정]
   리전: asia-northeast2 (서울)
   데이터베이스 버전: MySQL 8.0
   ```
5. **컴퓨팅 엔진 구성**:
   ```
   머신 유형: 공유 코어
   - db-f1-micro (가장 저렴)
   - vCPU: 1개 (공유)
   - RAM: 0.6GB
   ```
6. **스토리지**:
   ```
   스토리지 유형: SSD
   스토리지 용량: 10GB (최소)
   자동 증가: 활성화 권장
   ```
7. **만들기** 클릭

### Step 3: 데이터베이스 생성

1. 생성된 인스턴스 클릭
2. **데이터베이스** 탭
3. **데이터베이스 만들기**
4. 이름: `chopplan`
5. **만들기**

### Step 4: 공용 IP 설정 (로컬에서 접근하려면)

1. **개요** 탭
2. **연결** 섹션
3. **네트워크** 클릭
4. **공용 IP 추가**
5. **승인된 네트워크**에 본인 IP 추가

### Step 5: 데이터 마이그레이션 ⭐

**방법 A: Google Cloud Console 사용 (가장 쉬움)**

#### 5-1. 로컬 데이터베이스 덤프 생성

**배치 스크립트 실행:**
```bash
create-gcp-backup-simple.bat
```

**또는 직접 실행:**
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

**결과:** `chopplan_backup.sql` 파일 생성됨 (약 0.27MB)

#### 5-2. Google Cloud Storage에 업로드

1. **Google Cloud Console** 접속
2. **Cloud Storage** > **버킷** 클릭
3. **버킷 만들기**:
   - 이름: `chopplan-backups`
   - 위치: `asia-northeast2` (서울)
   - 기본값 선택
4. **업로드** 클릭
5. `chopplan_backup.sql` 파일 선택
6. **업로드** 완료

#### 5-3. Cloud SQL로 가져오기

1. **Cloud SQL** 메뉴 클릭
2. 인스턴스 `chopplan-db` 선택
3. **데이터베이스** 탭 클릭
4. **데이터 가져오기** 버튼 클릭
5. 설정:
   ```
   파일 소스: Cloud Storage 버킷
   버킷: chopplan-backups
   SQL 파일: chopplan_backup.sql
   형식: SQL
   데이터베이스: chopplan
   ```
6. **가져오기** 클릭
7. 완료 대기 (몇 분 소요)

#### 5-4. 데이터 확인

**Cloud SQL에서:**
```sql
SELECT COUNT(*) FROM restaurants;
SELECT COUNT(*) FROM demo_users;
```

**성공 확인:**
- restaurants: 999개 (또는 좌표 업데이트 후 개수)
- 데이터가 정상적으로 옮겨졌는지 확인

---

**방법 B: DBeaver 사용 (GUI, 간단함)**

1. **DBeaver**에서 Cloud SQL에 연결 (Step 4 참고)
2. **SQL 편집기** 열기
3. `chopplan_backup.sql` 파일 열기
4. **실행** (Ctrl+Enter)

**자세한 방법은 `GCP_MIGRATION_DETAILED.md` 참고**

---

## 💰 예상 비용

**월 예상 비용**: $10-15
- **$300 크레딧으로 약 20-30개월 무료!**

**현재 데이터 크기**: 0.27MB
- **10GB 스토리지로 충분합니다!**

---

## ✅ 결론

**충분히 가능합니다!** 🎉

- ✅ 데이터베이스가 매우 작음 (0.27MB)
- ✅ 무료 크레딧 $300으로 20-30개월 사용 가능
- ✅ 가장 작은 인스턴스 사용 가능

지금 바로 설정하시겠습니까?

