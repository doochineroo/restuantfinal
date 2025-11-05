# ✅ Google Cloud 배포 전 필수 체크리스트

## 🔍 사전에 설정/등록해야 하는 것들

---

## 1️⃣ Google Cloud 계정 및 프로젝트 ⭐ 필수

### ✅ 체크 항목:

- [ ] **Google Cloud 계정 생성 완료**
  - https://console.cloud.google.com 접속
  - Gmail 계정으로 로그인

- [ ] **프로젝트 생성 완료**
  - 프로젝트 이름: `chopplan-project` (또는 원하는 이름)
  - 프로젝트 ID 확인 필요

- [ ] **결제 계정 연결 완료**
  - $300 무료 크레딧 받기
  - 결제 정보 입력 (카드 등록 필요, 실제 과금 없이 크레딧만 사용)

### 📝 확인 방법:

1. Cloud Console 접속
2. 상단 프로젝트 선택 드롭다운에서 프로젝트 확인
3. **결제** 메뉴에서 결제 계정 확인

### 🔧 빠른 설정:

```bash
gcloud-login.bat
```
이 스크립트가 로그인 및 프로젝트 설정을 안내합니다.

---

## 2️⃣ gcloud CLI 설치 및 로그인 ⭐ 필수

### ✅ 체크 항목:

- [ ] **gcloud CLI 설치 완료**
  - 다운로드: https://cloud.google.com/sdk/docs/install

- [ ] **gcloud 로그인 완료**
  ```bash
  gcloud auth login
  ```

- [ ] **프로젝트 설정 완료**
  ```bash
  gcloud config set project [YOUR_PROJECT_ID]
  ```

- [ ] **Compute Engine API 활성화**
  ```bash
  gcloud services enable compute.googleapis.com
  ```

### 📝 확인 방법:

```bash
# 로그인 확인
gcloud auth list

# 프로젝트 확인
gcloud config get-value project

# API 활성화 확인
gcloud services list --enabled
```

### 🔧 빠른 설정:

```bash
gcloud-login.bat
```
이 스크립트가 로그인 상태를 확인하고 필요시 로그인을 도와줍니다.

---

## 3️⃣ Cloud SQL 설정 ⭐ 필수

### ✅ 체크 항목:

- [ ] **Cloud SQL 인스턴스 생성 완료**
  - 인스턴스 ID: `chopplan-db`
  - 리전: `asia-northeast2` (서울)
  - 머신 유형: `db-f1-micro` (가장 저렴)
  - 비밀번호 설정 완료

- [ ] **데이터베이스 생성 완료**
  - 데이터베이스 이름: `chopplan`

- [ ] **공용 IP 활성화 완료**
  - Cloud SQL 인스턴스 > 연결 > 네트워크
  - 공용 IP 추가 완료

- [ ] **승인된 네트워크 설정 (선택사항)**
  - 현재 IP 주소 추가 (로컬에서 접근 시)

- [ ] **데이터 마이그레이션 완료**
  - 로컬 데이터베이스 → Cloud SQL로 이전 완료

### 📝 확인 방법:

1. Cloud Console > SQL > 인스턴스 선택
2. **개요** 탭에서 공용 IP 확인
3. **데이터베이스** 탭에서 `chopplan` 데이터베이스 확인

---

## 4️⃣ Compute Engine VM 생성 ⭐ 필수

### ✅ 체크 항목:

- [ ] **VM 인스턴스 생성 완료**
  - 인스턴스 이름: `chopplan-server` (또는 원하는 이름)
  - 리전: `us-west1` (무료 티어) 또는 `asia-northeast2` (서울)
  - 머신 유형: `e2-micro`
  - 운영체제: Ubuntu 22.04 LTS

- [ ] **외부 IP 확인**
  - 인스턴스 목록에서 외부 IP 확인 필요

### 📝 생성 방법:

**Cloud Console에서:**
1. Compute Engine > VM 인스턴스
2. 인스턴스 만들기
3. 설정 입력 후 만들기

**또는 gcloud CLI로:**
```bash
gcloud compute instances create chopplan-server \
    --zone=us-west1-a \
    --machine-type=e2-micro \
    --boot-disk-size=30GB \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud
```

---

## 5️⃣ 방화벽 규칙 설정 ⚠️ 필수 (나중에 설정 가능)

### ✅ 체크 항목:

- [ ] **포트 8080 방화벽 규칙 생성**
  - 이름: `allow-http-8080`
  - 포트: TCP 8080
  - 소스 IP: 0.0.0.0/0

### 📝 설정 방법:

```bash
gcloud compute firewall-rules create allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP port 8080"
```

또는 Cloud Console에서:
- VPC 네트워크 > 방화벽 규칙 > 방화벽 규칙 만들기

---

## 📋 빠른 체크 스크립트

### check-gcp-prerequisites.bat

위의 모든 항목을 자동으로 확인하는 스크립트를 생성했습니다.

---

## ✅ 다음 단계

모든 항목이 체크되면:

1. **VM 초기 설정**
   ```bash
   setup-gcp-compute-engine-vm.bat
   ```

2. **연결 정보 설정**
   ```bash
   setup-gcp-connection-info.bat
   ```

3. **애플리케이션 배포**
   ```bash
   deploy-gcp-compute-engine.bat
   ```

---

## 🆘 빠진 항목이 있다면?

각 항목별로 설정 가이드가 있습니다:
- Cloud SQL: `setup-gcp-cloud-sql.md`
- Compute Engine: `GCP_COMPUTE_ENGINE_DEPLOY.md`
- 전체 가이드: `GCP_COMPLETE_DEPLOYMENT_GUIDE.md`

