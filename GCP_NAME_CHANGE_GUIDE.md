# 🔄 GCP 사이트 이름 변경 가이드

## 📋 변경 가능한 항목

### 1. 프로젝트 이름 (변경 가능 ✅)
- **프로젝트 이름**: 화면에 보이는 이름 (변경 가능)
- **프로젝트 ID**: 실제 식별자 (변경 불가, 새 프로젝트 생성 필요)

### 2. VM 인스턴스 이름 (기존 인스턴스 변경 불가 ❌)
- **기존 인스턴스**: 이름 변경 불가
- **해결 방법**: 새 인스턴스 생성 후 기존 것 삭제

---

## 🔄 방법 1: 프로젝트 이름 변경

### Cloud Console에서 변경

1. **Google Cloud Console** 접속: https://console.cloud.google.com
2. 상단 프로젝트 선택기 클릭
3. **프로젝트 설정** (톱니바퀴 아이콘) 클릭
4. **프로젝트 이름** 수정
5. **저장** 클릭

### gcloud CLI로 변경

```bash
# 현재 프로젝트 확인
gcloud config get-value project

# 프로젝트 이름 변경 (프로젝트 ID는 변경 불가)
gcloud projects update [PROJECT_ID] --name="새 프로젝트 이름"
```

**⚠️ 주의:**
- 프로젝트 ID는 변경할 수 없습니다
- 프로젝트 ID를 변경하려면 새 프로젝트를 생성해야 합니다

---

## 🔄 방법 2: VM 인스턴스 이름 변경

기존 VM 인스턴스는 이름을 변경할 수 없습니다. 새 인스턴스를 생성하고 기존 것을 삭제해야 합니다.

### 2-1. 새 인스턴스 생성 (원하는 이름으로)

```bash
# 새 인스턴스 생성 (예: my-chopplan-server)
gcloud compute instances create my-chopplan-server \
    --zone=us-west1-a \
    --machine-type=e2-micro \
    --boot-disk-size=30GB \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --tags=http-server,https-server
```

### 2-2. 기존 인스턴스의 디스크 백업 (선택사항)

```bash
# 기존 인스턴스의 디스크를 스냅샷으로 백업
gcloud compute disks snapshot chopplan-server \
    --snapshot-names=chopplan-server-backup \
    --zone=us-west1-a
```

### 2-3. 새 인스턴스에 데이터 복사

```bash
# 기존 인스턴스에서 새 인스턴스로 파일 복사
gcloud compute scp chopplan-server:~/chopplan/* my-chopplan-server:~/chopplan/ --zone=us-west1-a --recurse
```

### 2-4. 새 인스턴스 설정 (Java, MySQL 등)

```bash
# 새 인스턴스에 Java 설치
gcloud compute ssh my-chopplan-server --zone=us-west1-a --command="sudo apt update && sudo apt install openjdk-17-jdk -y"

# MySQL 설치
gcloud compute ssh my-chopplan-server --zone=us-west1-a --command="sudo apt install mysql-server -y"
```

### 2-5. 문서 업데이트

모든 문서에서 `chopplan-server`를 `my-chopplan-server`로 변경:

1. `MANUAL_DEPLOYMENT_GUIDE.md`
2. `GCP_COMPLETE_DEPLOYMENT_GUIDE.md`
3. `deploy-gcp-compute-engine.bat`
4. 기타 관련 파일들

### 2-6. 기존 인스턴스 삭제 (선택사항)

```bash
# 기존 인스턴스 삭제
gcloud compute instances delete chopplan-server --zone=us-west1-a

# 삭제 확인
gcloud compute instances list
```

---

## 🔄 방법 3: 빠른 이름 변경 스크립트

### rename-vm-instance.bat

```batch
@echo off
REM VM 인스턴스 이름 변경 스크립트

chcp 65001 >nul
echo ============================================
echo    VM 인스턴스 이름 변경
echo ============================================
echo.

set /p OLD_NAME="기존 인스턴스 이름 (예: chopplan-server): "
if "%OLD_NAME%"=="" (
    echo ❌ 인스턴스 이름을 입력해야 합니다.
    pause
    exit /b 1
)

set /p NEW_NAME="새 인스턴스 이름: "
if "%NEW_NAME%"=="" (
    echo ❌ 새 인스턴스 이름을 입력해야 합니다.
    pause
    exit /b 1
)

set /p ZONE="리전-존 (예: us-west1-a): "
if "%ZONE%"=="" (
    echo ❌ 존을 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo ⚠️  주의: 기존 인스턴스는 이름을 변경할 수 없습니다.
echo    새 인스턴스를 생성하고 기존 것을 삭제해야 합니다.
echo.
set /p CONFIRM="계속하시겠습니까? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 📋 다음 단계를 수동으로 진행하세요:
echo.
echo 1. 새 인스턴스 생성:
echo    gcloud compute instances create %NEW_NAME% --zone=%ZONE% --machine-type=e2-micro --boot-disk-size=30GB --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud
echo.
echo 2. 기존 인스턴스에서 데이터 복사:
echo    gcloud compute scp %OLD_NAME%:~/chopplan/* %NEW_NAME%:~/chopplan/ --zone=%ZONE% --recurse
echo.
echo 3. 새 인스턴스 설정 (Java, MySQL 등)
echo.
echo 4. 모든 문서에서 %OLD_NAME%를 %NEW_NAME%로 변경
echo.
echo 5. 기존 인스턴스 삭제 (선택사항):
echo    gcloud compute instances delete %OLD_NAME% --zone=%ZONE%
echo.

pause
```

---

## 📝 문서 업데이트 체크리스트

인스턴스 이름을 변경한 후 다음 파일들을 업데이트하세요:

- [ ] `MANUAL_DEPLOYMENT_GUIDE.md`
- [ ] `GCP_COMPLETE_DEPLOYMENT_GUIDE.md`
- [ ] `GCP_COMPUTE_ENGINE_DEPLOY.md`
- [ ] `README.md`
- [ ] `deploy-gcp-compute-engine.bat`
- [ ] `setup-gcp-compute-engine-vm.bat`
- [ ] `setup-gcp-connection-info.bat`
- [ ] 기타 배포 스크립트들

### 빠른 검색 및 변경

```bash
# PowerShell에서 모든 파일에서 검색
Select-String -Path "*.md","*.bat" -Pattern "chopplan-server" -Recurse

# 수동으로 각 파일 열어서 변경
```

---

## ⚠️ 주의사항

1. **VM 인스턴스 이름 변경은 복잡합니다**
   - 기존 인스턴스는 이름 변경 불가
   - 새 인스턴스 생성 → 데이터 복사 → 기존 인스턴스 삭제 필요

2. **프로젝트 ID는 변경 불가**
   - 프로젝트 ID를 변경하려면 새 프로젝트 생성 필요
   - 모든 리소스를 새 프로젝트로 이동해야 함

3. **데이터 백업 필수**
   - 인스턴스 삭제 전 반드시 데이터 백업
   - MySQL 데이터베이스 백업 필수

4. **외부 IP 변경**
   - 새 인스턴스를 만들면 외부 IP가 변경됨
   - `.env.production` 파일 업데이트 필요
   - `apiConfig.js` 업데이트 필요

---

## ✅ 추천 방법

**가장 간단한 방법:**
1. 프로젝트 이름만 변경 (프로젝트 ID는 그대로)
2. VM 인스턴스 이름은 그대로 사용 (`chopplan-server`)
3. 필요시 새 프로젝트 생성 후 리소스 이동

**인스턴스 이름을 반드시 변경해야 한다면:**
1. 새 인스턴스 생성
2. 데이터 백업 및 복사
3. 모든 설정 재구성
4. 문서 업데이트
5. 기존 인스턴스 삭제

---

**✅ 이제 원하는 이름으로 변경할 수 있습니다!**


