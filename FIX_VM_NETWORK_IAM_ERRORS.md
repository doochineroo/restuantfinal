# 🔧 VM Network Management API 및 IAM 권한 오류 해결

VM에서 발생하는 Network Management API와 IAM 권한 오류를 해결하는 방법입니다.

---

## ❌ 오류 메시지

```
Network Management API has not been used in project chopplan before or it is disabled. 
Enable it by visiting https://console.developers.google.com/apis/api/networkmanagement.googleapis.com/overview?project=chopplan then retry.

IAM 권한
테스트 건너뜀
```

---

## ✅ 해결 방법

### 방법 1: 자동 스크립트 사용 (추천)

```bash
fix-vm-network-iam-errors.bat
```

이 스크립트가 자동으로:
1. Network Management API 활성화
2. Compute Engine API 활성화
3. IAM 권한 확인
4. 필요한 권한 안내

---

### 방법 2: 수동으로 해결

#### Step 1: Network Management API 활성화

**gcloud CLI로:**
```bash
gcloud services enable networkmanagement.googleapis.com
```

**Cloud Console로:**
1. https://console.developers.google.com/apis/api/networkmanagement.googleapis.com/overview?project=chopplan
2. **사용 설정** 클릭

---

#### Step 2: IAM 권한 확인 및 부여

**필요한 역할:**
- `Compute Engine Admin` (roles/compute.admin)
- `Compute Network Admin` (roles/compute.networkAdmin)
- `Service Account User` (roles/iam.serviceAccountUser)

**Cloud Console에서 권한 부여:**
1. https://console.cloud.google.com/iam-admin/iam?project=chopplan
2. 현재 사용자 계정 찾기
3. **연필 아이콘** 클릭
4. **역할 추가** 클릭
5. 다음 역할 추가:
   - Compute Engine Admin
   - Compute Network Admin
   - Service Account User
6. **저장** 클릭

**gcloud CLI로 권한 부여 (프로젝트 소유자 권한 필요):**
```bash
# 현재 사용자 계정 확인
gcloud config get-value account

# Compute Engine Admin 역할 부여
gcloud projects add-iam-policy-binding chopplan \
    --member="user:YOUR_EMAIL@gmail.com" \
    --role="roles/compute.admin"

# Compute Network Admin 역할 부여
gcloud projects add-iam-policy-binding chopplan \
    --member="user:YOUR_EMAIL@gmail.com" \
    --role="roles/compute.networkAdmin"

# Service Account User 역할 부여
gcloud projects add-iam-policy-binding chopplan \
    --member="user:YOUR_EMAIL@gmail.com" \
    --role="roles/iam.serviceAccountUser"
```

---

## ⏱️ API 활성화 대기 시간

API를 활성화한 후 **1-3분 정도** 기다려야 합니다.

활성화가 완료되기 전에 명령을 실행하면 같은 오류가 발생할 수 있습니다.

---

## 🔍 확인 방법

### API 활성화 확인

```bash
# 활성화된 API 목록 확인
gcloud services list --enabled --filter="name:networkmanagement.googleapis.com"

# 또는 Cloud Console에서 확인
# https://console.developers.google.com/apis/library?project=chopplan
```

### IAM 권한 확인

```bash
# 현재 사용자의 IAM 권한 확인
gcloud projects get-iam-policy chopplan \
    --flatten="bindings[].members" \
    --filter="bindings.members:user:$(gcloud config get-value account)" \
    --format="table(bindings.role)"
```

---

## ❓ 문제 해결

### 여전히 오류가 발생하는 경우

1. **API 활성화 대기**
   - 2-3분 더 기다린 후 다시 시도

2. **IAM 권한 확인**
   - Cloud Console에서 실제로 권한이 부여되었는지 확인
   - 프로젝트 소유자 권한이 필요할 수 있음

3. **프로젝트 확인**
   ```bash
   gcloud config get-value project
   ```
   - 올바른 프로젝트가 설정되어 있는지 확인

4. **로그인 확인**
   ```bash
   gcloud auth list
   ```
   - 올바른 계정으로 로그인되어 있는지 확인

---

## 📋 빠른 체크리스트

- [ ] Network Management API 활성화 완료
- [ ] Compute Engine API 활성화 완료
- [ ] IAM 권한 부여 완료 (Compute Engine Admin, Compute Network Admin, Service Account User)
- [ ] API 활성화 후 2-3분 대기
- [ ] VM 명령어 재실행

---

## 💡 추가 팁

### 필요한 모든 API 한 번에 활성화

```bash
# 필수 API 활성화
gcloud services enable \
    compute.googleapis.com \
    networkmanagement.googleapis.com \
    sqladmin.googleapis.com \
    --project=chopplan
```

### 프로젝트 소유자 확인

프로젝트 소유자 권한이 없으면 IAM 권한을 직접 부여할 수 없습니다.
프로젝트 소유자에게 요청하여 권한을 부여받아야 합니다.

---

## ✅ 완료 후

모든 설정이 완료되면 VM 명령어가 정상적으로 작동합니다:

```bash
# VM 인스턴스 목록 확인
gcloud compute instances list --zone=us-west1-a

# VM SSH 접속
gcloud compute ssh chopplan-server --zone=us-west1-a

# 파일 업로드
gcloud compute scp file.jar chopplan-server:~/ --zone=us-west1-a
```

