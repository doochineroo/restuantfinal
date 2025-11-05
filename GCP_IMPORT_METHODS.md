# 📥 Google Cloud SQL 데이터 가져오기 방법 (UI 변경 대응)

## ❌ "데이터 가져오기" 버튼이 없을 때

Google Cloud Console의 UI가 변경되었거나, 위치가 다른 경우입니다.

---

## ✅ 방법 1: SQL 편집기 사용 (가장 쉬움) ⭐⭐⭐ 추천

### Step 1: Cloud SQL 연결

**DBeaver 사용 (추천):**
1. DBeaver 실행
2. 새 연결 > MySQL
3. 설정:
   ```
   호스트: [Cloud SQL Public IP]
   포트: 3306
   데이터베이스: chopplan
   사용자: root
   비밀번호: [GCP 비밀번호]
   ```
4. 테스트 연결 후 저장

### Step 2: 백업 파일 생성

```bash
create-gcp-backup-simple.bat
```

### Step 3: SQL 파일 실행

1. DBeaver에서 Cloud SQL 연결
2. **SQL 편집기** 열기 (Ctrl+\)
3. `chopplan_backup.sql` 파일 열기
4. **실행** (Ctrl+Enter)
5. 완료 대기

**이 방법이 가장 쉽고 빠릅니다!**

---

## ✅ 방법 2: Cloud Console SQL 편집기 사용

### Step 1: Cloud SQL SQL 편집기 열기

1. **Cloud SQL** > 인스턴스 `chopplan-db` 선택
2. 상단 탭에서 **쿼리** 또는 **SQL 편집기** 클릭
3. **새 쿼리** 클릭

### Step 2: SQL 파일 내용 붙여넣기

1. 로컬에서 `chopplan_backup.sql` 파일 열기
2. 전체 내용 복사 (Ctrl+A, Ctrl+C)
3. Cloud Console SQL 편집기에 붙여넣기 (Ctrl+V)
4. **실행** 클릭

---

## ✅ 방법 3: gcloud CLI 사용

### Step 1: gcloud CLI 설치

1. https://cloud.google.com/sdk/docs/install 접속
2. Windows용 설치 프로그램 다운로드
3. 설치 및 초기화

### Step 2: 인증

```bash
gcloud auth login
gcloud config set project [PROJECT_ID]
```

### Step 3: Cloud Storage 업로드

```bash
# 버킷 생성 (없으면)
gsutil mb gs://chopplan-backups

# 파일 업로드
gsutil cp chopplan_backup.sql gs://chopplan-backups/
```

### Step 4: Cloud SQL로 가져오기

```bash
gcloud sql import sql chopplan-db \
    gs://chopplan-backups/chopplan_backup.sql \
    --database=chopplan
```

---

## ✅ 방법 4: Cloud Console에서 다른 위치 확인

### 찾을 수 있는 위치들:

1. **인스턴스 개요 페이지**
   - 상단에 **가져오기** 또는 **Import** 버튼

2. **데이터베이스 탭**
   - `chopplan` 데이터베이스 클릭
   - 상단에 **가져오기** 버튼

3. **작업** 탭
   - **데이터 가져오기** 메뉴

4. **인스턴스 설정**
   - **데이터 가져오기/내보내기** 섹션

---

## ✅ 방법 5: MySQL 클라이언트 직접 사용 (Cloud SQL Proxy 필요)

### Step 1: Cloud SQL Proxy 설치

```bash
# PowerShell
Invoke-WebRequest -Uri "https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe" -OutFile "cloud_sql_proxy.exe"
```

### Step 2: Proxy 실행

```bash
# 연결 이름 확인 (Cloud SQL > 개요)
cloud_sql_proxy.exe -instances=[PROJECT_ID]:asia-northeast2:chopplan-db=tcp:3307
```

### Step 3: 데이터 가져오기

**새 터미널에서:**
```bash
mysql -u root -p[GCP_PASSWORD] -h 127.0.0.1 -P 3307 chopplan < chopplan_backup.sql
```

---

## 🎯 가장 쉬운 방법 추천 순서

1. **⭐ DBeaver 사용** (방법 1) - 가장 간단하고 빠름
2. **Cloud Console SQL 편집기** (방법 2) - UI에서 직접
3. **gcloud CLI** (방법 3) - 명령줄 선호 시
4. **MySQL 클라이언트** (방법 5) - 고급 사용자

---

## 💡 DBeaver 사용법 (1분 완료)

1. **DBeaver** 실행
2. Cloud SQL 연결 (이미 Step 4에서 설정했다면 그대로 사용)
3. `chopplan_backup.sql` 파일 드래그 앤 드롭
4. **실행** 버튼 클릭
5. 완료!

**이게 가장 빠릅니다!** 🚀



