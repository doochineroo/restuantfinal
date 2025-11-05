# 🔄 Google Cloud SQL 데이터 마이그레이션 상세 가이드

## 📋 5단계: 데이터 마이그레이션

로컬 MySQL 데이터베이스를 Google Cloud SQL로 옮기는 방법입니다.

---

## 🔹 방법 1: Google Cloud Console에서 직접 가져오기 (가장 쉬움) ⭐ 추천

### Step 1: 데이터베이스 덤프 생성

**로컬에서 실행:**
```bash
migrate-to-gcp-cloud-sql.bat
```

또는 직접:
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

### Step 2: Google Cloud Storage에 업로드

1. **Google Cloud Console** 접속
2. **Cloud Storage** > **버킷 만들기**
3. 버킷 이름: `chopplan-backups`
4. **업로드** 클릭
5. `chopplan_backup.sql` 파일 업로드

### Step 3: Cloud SQL로 가져오기

1. **Cloud SQL** > 인스턴스 선택 (`chopplan-db`)
2. **데이터베이스** 탭
3. **데이터 가져오기** 클릭
4. **파일 소스**: Cloud Storage 버킷 선택
5. **파일**: `chopplan_backup.sql` 선택
6. **데이터베이스**: `chopplan` 선택
7. **가져오기** 클릭

**완료!** 데이터가 GCP로 옮겨집니다.

---

## 🔹 방법 2: Cloud SQL Proxy 사용 (개발에 편리)

### Step 1: Cloud SQL Proxy 설치

**Windows:**
```bash
# PowerShell에서
Invoke-WebRequest -Uri "https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe" -OutFile "cloud_sql_proxy.exe"
```

### Step 2: Cloud SQL Proxy 실행

```bash
# 연결 이름 찾기 (Cloud SQL 인스턴스 > 개요 > 연결 이름)
cloud_sql_proxy.exe -instances=[PROJECT_ID]:asia-northeast2:chopplan-db=tcp:3307
```

**연결 이름 형식**: `[PROJECT_ID]:[REGION]:[INSTANCE_NAME]`

### Step 3: 로컬에서 직접 가져오기

```bash
# Proxy가 3307 포트로 연결 중일 때
mysqldump -u root -p[GCP_PASSWORD] -h 127.0.0.1 -P 3307 chopplan > chopplan_backup.sql

# 또는 직접 import
mysql -u root -p[GCP_PASSWORD] -h 127.0.0.1 -P 3307 chopplan < chopplan_backup.sql
```

---

## 🔹 방법 3: gcloud CLI 사용

### Step 1: gcloud CLI 설치

1. https://cloud.google.com/sdk/docs/install 접속
2. Windows용 설치 프로그램 다운로드
3. 설치 및 초기화

### Step 2: 인증 및 프로젝트 설정

```bash
gcloud auth login
gcloud config set project [PROJECT_ID]
```

### Step 3: Cloud Storage에 업로드

```bash
# 버킷 생성 (이미 있으면 생략)
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

## 🔹 방법 4: MySQL Workbench 사용 (GUI)

### Step 1: Cloud SQL에 연결

1. **MySQL Workbench** 실행
2. **새 연결** 생성
3. 설정:
   ```
   Hostname: [Cloud SQL Public IP]
   Port: 3306
   Username: root
   Password: [GCP 비밀번호]
   ```
4. **테스트 연결** 후 연결

### Step 2: 데이터 가져오기

1. **Server** > **Data Import**
2. **Import from Self-Contained File**
3. **파일 선택**: `chopplan_backup.sql`
4. **Default Target Schema**: `chopplan` 선택
5. **Start Import** 클릭

---

## 🔹 방법 5: DBeaver 사용 (GUI) ⭐ 간단함

### Step 1: Cloud SQL에 연결

1. **DBeaver** 실행
2. **새 연결** > **MySQL**
3. 설정:
   ```
   Host: [Cloud SQL Public IP]
   Port: 3306
   Database: chopplan
   Username: root
   Password: [GCP 비밀번호]
   ```
4. **테스트 연결**

### Step 2: SQL 스크립트 실행

1. **SQL 편집기** 열기
2. `chopplan_backup.sql` 파일 열기
3. **실행** (Ctrl+Enter)

---

## 📝 단계별 체크리스트

### 준비 단계:
- [ ] 로컬 데이터베이스 백업 완료
- [ ] Google Cloud SQL 인스턴스 생성 완료
- [ ] 데이터베이스 `chopplan` 생성 완료
- [ ] Public IP 설정 완료

### 마이그레이션 단계:
- [ ] 덤프 파일 생성 (`chopplan_backup.sql`)
- [ ] Cloud Storage 업로드 (방법 1인 경우)
- [ ] Cloud SQL로 가져오기 실행
- [ ] 데이터 확인

### 확인 단계:
- [ ] restaurants 테이블 데이터 확인
- [ ] 다른 테이블 데이터 확인
- [ ] 애플리케이션 연결 테스트

---

## ✅ 가장 쉬운 방법 추천

**방법 1 (Google Cloud Console) 또는 방법 5 (DBeaver)** 추천:
- GUI로 쉽게 가능
- 단계가 명확함
- 에러 발생 시 확인 용이

---

## 🔍 마이그레이션 확인

**Cloud SQL에서 확인:**
```sql
SELECT COUNT(*) FROM restaurants;
SELECT COUNT(*) FROM demo_users;
```

**로컬과 비교:**
```bash
# 로컬
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) FROM restaurants;"

# GCP (연결 후)
mysql -u root -p[GCP_PASSWORD] -h [CLOUD_SQL_IP] chopplan -e "SELECT COUNT(*) FROM restaurants;"
```

---

## 💡 팁

1. **작은 파일**: 현재 0.27MB이므로 매우 빠르게 가져올 수 있습니다
2. **인덱스 자동 생성**: 가져온 후 자동으로 인덱스가 생성됩니다
3. **연결 테스트**: 가져온 후 반드시 애플리케이션으로 연결 테스트

---

## 🚀 다음 단계

마이그레이션 완료 후:
1. `application-gcp.properties` 설정 업데이트
2. 애플리케이션 재시작
3. 연결 테스트



