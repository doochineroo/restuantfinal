# 🖥️ Cloud SQL CLI 설정 가이드

Google Cloud CLI를 사용하여 Cloud SQL을 설정하는 방법입니다.

## 📋 사전 준비

### 1. gcloud CLI 설치
```bash
# Windows 설치 프로그램 다운로드
https://cloud.google.com/sdk/docs/install
```

설치 후:
```bash
gcloud --version
```

### 2. 로그인
```bash
gcloud auth login
```

### 3. 프로젝트 설정
```bash
# 프로젝트 목록 확인
gcloud projects list

# 프로젝트 설정
gcloud config set project [PROJECT_ID]
```

## 🚀 빠른 설정 (자동 스크립트)

### 방법 1: 자동 스크립트 사용 (권장)
```bash
setup-cloud-sql-cli.bat
```

이 스크립트는:
1. Cloud SQL Admin API 활성화
2. Cloud SQL 인스턴스 생성
3. 데이터베이스 생성
4. Public IP 설정
5. 네트워크 설정

## 📝 수동 설정 (CLI 명령어)

### 1단계: API 활성화
```bash
gcloud services enable sqladmin.googleapis.com
```

### 2단계: Cloud SQL 인스턴스 생성
```bash
gcloud sql instances create chopplan-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=asia-northeast2 \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup-start-time=03:00 \
    --enable-bin-log \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 \
    --root-password=chopplan123
```

**설정 설명:**
- `--tier=db-f1-micro`: 가장 저렴한 인스턴스
- `--region=asia-northeast2`: 서울 리전
- `--storage-size=10GB`: 최소 스토리지
- `--root-password`: root 비밀번호 설정

### 3단계: 데이터베이스 생성
```bash
gcloud sql databases create chopplan \
    --instance=chopplan-db \
    --charset=utf8mb4 \
    --collation=utf8mb4_unicode_ci
```

### 4단계: Public IP 확인
```bash
gcloud sql instances describe chopplan-db \
    --format="value(ipAddresses[0].ipAddress)"
```

### 5단계: 네트워크 설정 (현재 IP 추가)
```bash
# 현재 IP 확인
curl https://api.ipify.org

# IP를 승인된 네트워크에 추가
gcloud sql instances patch chopplan-db \
    --authorized-networks=[YOUR_IP]/32
```

**모든 IP 허용 (개발용만, 위험!):**
```bash
gcloud sql instances patch chopplan-db \
    --authorized-networks=0.0.0.0/0
```

### 6단계: 비밀번호 변경 (선택)
```bash
gcloud sql users set-password root \
    --host=% \
    --instance=chopplan-db \
    --password=[NEW_PASSWORD]
```

## 🔍 인스턴스 확인

### 인스턴스 목록
```bash
gcloud sql instances list
```

### 인스턴스 상세 정보
```bash
gcloud sql instances describe chopplan-db
```

### 데이터베이스 목록
```bash
gcloud sql databases list --instance=chopplan-db
```

### 연결 정보 확인
```bash
# Public IP
gcloud sql instances describe chopplan-db \
    --format="value(ipAddresses[0].ipAddress)"

# 연결 이름
gcloud sql instances describe chopplan-db \
    --format="value(connectionName)"
```

## 🔄 데이터 마이그레이션 (CLI)

### 로컬 → Cloud SQL

**1. 로컬 데이터베이스 덤프**
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

**2. Cloud Storage에 업로드**
```bash
# 버킷 생성 (없으면)
gsutil mb gs://chopplan-backups

# 파일 업로드
gsutil cp chopplan_backup.sql gs://chopplan-backups/
```

**3. Cloud SQL로 가져오기**
```bash
gcloud sql import sql chopplan-db \
    gs://chopplan-backups/chopplan_backup.sql \
    --database=chopplan
```

### Cloud SQL → 로컬

**1. Cloud SQL 덤프**
```bash
gcloud sql export sql chopplan-db \
    gs://chopplan-backups/chopplan_backup.sql \
    --database=chopplan
```

**2. 다운로드**
```bash
gsutil cp gs://chopplan-backups/chopplan_backup.sql .
```

**3. 로컬에 복원**
```bash
mysql -u root -p1234 chopplan < chopplan_backup.sql
```

## 🔧 인스턴스 관리

### 인스턴스 시작/중지
```bash
# 중지 (과금 중지)
gcloud sql instances patch chopplan-db --activation-policy=NEVER

# 시작
gcloud sql instances patch chopplan-db --activation-policy=ALWAYS
```

### 인스턴스 삭제
```bash
gcloud sql instances delete chopplan-db
```

**⚠️ 주의: 삭제하면 데이터가 영구적으로 삭제됩니다!**

## 📊 모니터링

### 사용량 확인
```bash
gcloud sql instances describe chopplan-db \
    --format="table(settings.dataDiskSizeGb,settings.dataDiskType)"
```

### 로그 확인
```bash
gcloud sql operations list --instance=chopplan-db
```

## ⚙️ application-cloudsql.properties 설정

CLI로 확인한 정보로 설정:

```properties
# Public IP 사용
spring.datasource.url=jdbc:mysql://[PUBLIC_IP]:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=[설정한 비밀번호]
```

## 🚀 실행

```bash
# 백엔드 (Cloud SQL 사용)
quick-test-local-cloudsql.bat

# 또는 직접 실행
gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
```

## ❓ 문제 해결

### "Permission denied"
```bash
# 권한 확인
gcloud auth list
gcloud config get-value project
```

### "API not enabled"
```bash
gcloud services enable sqladmin.googleapis.com
```

### "Instance not found"
```bash
# 인스턴스 목록 확인
gcloud sql instances list
```

### "Network access denied"
```bash
# 승인된 네트워크 확인
gcloud sql instances describe chopplan-db \
    --format="value(settings.ipConfiguration.authorizedNetworks[].value)"

# IP 추가
gcloud sql instances patch chopplan-db \
    --authorized-networks=[YOUR_IP]/32
```

## 💡 유용한 명령어 모음

```bash
# 모든 설정 확인
gcloud sql instances describe chopplan-db

# Public IP 확인
gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)"

# 데이터베이스 목록
gcloud sql databases list --instance=chopplan-db

# 사용자 목록
gcloud sql users list --instance=chopplan-db

# 백업 목록
gcloud sql backups list --instance=chopplan-db
```

## 📚 참고 문서

- [Google Cloud SQL CLI 문서](https://cloud.google.com/sql/docs/mysql/admin-api)
- [gcloud sql 명령어 참조](https://cloud.google.com/sdk/gcloud/reference/sql)

