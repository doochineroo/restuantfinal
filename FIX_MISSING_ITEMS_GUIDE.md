# 🔧 빠진 항목 해결 가이드

## ⚠️ 현재 상황

체크 스크립트 결과, 다음 항목들이 빠져있을 수 있습니다:

1. **gcloud CLI 미설치** 또는 **로그인 필요**
2. **Cloud SQL 인스턴스 없음**
3. **Compute Engine VM 없음**
4. **API 미활성화**

---

## ✅ Step 1: gcloud CLI 설치 및 로그인 (필수!)

### 1-1. gcloud CLI 설치

**Windows:**
1. https://cloud.google.com/sdk/docs/install-sdk 접속
2. **Windows용 다운로드** 클릭
3. 설치 프로그램 실행
4. 기본 설정으로 설치

**설치 후:**
- 새로운 PowerShell 또는 CMD 창 열기 (중요!)
- 설치 확인:
  ```bash
  gcloud --version
  ```

### 1-2. gcloud 로그인

```bash
gcloud auth login
```

브라우저가 열리면 Google 계정으로 로그인

### 1-3. 프로젝트 설정

```bash
gcloud config set project [YOUR_PROJECT_ID]
```

프로젝트 ID는 Cloud Console에서 확인:
- https://console.cloud.google.com
- 상단 프로젝트 선택 드롭다운에서 프로젝트 ID 확인

---

## ✅ Step 2: API 활성화

```bash
# Compute Engine API 활성화
gcloud services enable compute.googleapis.com

# Cloud SQL Admin API 활성화
gcloud services enable sqladmin.googleapis.com
```

---

## ✅ Step 3: Cloud SQL 인스턴스 생성

### 방법 A: Cloud Console에서 (추천)

1. https://console.cloud.google.com/sql 접속
2. **인스턴스 만들기** 클릭
3. **MySQL** 선택
4. 설정 입력:
   ```
   인스턴스 ID: chopplan-db
   비밀번호: [안전한 비밀번호 설정]
   리전: asia-northeast2 (서울)
   머신 유형: db-f1-micro (가장 저렴)
   스토리지: 10GB
   ```
5. **만들기** 클릭

**상세 가이드:** `setup-gcp-cloud-sql.md` 참고

### 방법 B: gcloud CLI로

```bash
gcloud sql instances create chopplan-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=asia-northeast2 \
    --root-password=[YOUR_PASSWORD]
```

---

## ✅ Step 4: Compute Engine VM 생성

### 방법 A: Cloud Console에서 (추천)

1. https://console.cloud.google.com/compute/instances 접속
2. **인스턴스 만들기** 클릭
3. 설정:
   ```
   이름: chopplan-server
   리전: us-west1 (무료 티어) 또는 asia-northeast2 (서울)
   머신 유형: e2-micro
   부팅 디스크: Ubuntu 22.04 LTS, 30GB
   방화벽: HTTP, HTTPS 트래픽 허용
   ```
4. **만들기** 클릭

### 방법 B: gcloud CLI로 (자동 생성 스크립트 사용)

```bash
fix-gcp-missing-items.bat
```

선택지에서 "1" 선택하면 자동으로 생성됩니다.

또는 직접 실행:
```bash
gcloud compute instances create chopplan-server \
    --zone=us-west1-a \
    --machine-type=e2-micro \
    --boot-disk-size=30GB \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --tags=http-server,https-server
```

---

## 🔄 Step 5: 다시 확인

모든 설정이 완료되면:

```bash
check-gcp-prerequisites.bat
```

모든 항목이 ✅로 표시되면 준비 완료!

---

## 🚀 다음 단계

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

## 🆘 빠른 해결 방법

**자동 설정 스크립트 사용:**
```bash
fix-gcp-missing-items.bat
```

이 스크립트가 다음을 자동으로 수행합니다:
- ✅ API 활성화
- ✅ Cloud SQL 인스턴스 확인 및 생성 안내
- ✅ VM 인스턴스 확인 및 생성 옵션 제공

---

## 📝 체크리스트

각 단계 완료 후 체크:

- [ ] gcloud CLI 설치 완료
- [ ] gcloud 로그인 완료
- [ ] 프로젝트 설정 완료
- [ ] Compute Engine API 활성화
- [ ] Cloud SQL Admin API 활성화
- [ ] Cloud SQL 인스턴스 생성 완료
- [ ] Compute Engine VM 생성 완료
- [ ] check-gcp-prerequisites.bat 모두 ✅

**모두 체크되면 배포 준비 완료!** 🎉



