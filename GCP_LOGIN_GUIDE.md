# 🔐 Google Cloud 로그인 가이드

## gcloud CLI 로그인 방법

---

## 📋 Step 1: gcloud CLI 설치 확인

먼저 gcloud CLI가 설치되어 있는지 확인:

```bash
gcloud --version
```

**설치되지 않았다면:**
1. https://cloud.google.com/sdk/docs/install-sdk 접속
2. Windows용 다운로드
3. 설치 프로그램 실행
4. **중요:** 설치 후 새로운 PowerShell 또는 CMD 창 열기

---

## 🔑 Step 2: gcloud 로그인

### 방법 1: 브라우저를 통한 로그인 (추천)

```bash
gcloud auth login
```

**실행하면:**
1. 브라우저가 자동으로 열립니다
2. Google 계정 선택
3. "Google Cloud SDK에 대한 액세스 허용" 클릭
4. 로그인 완료!

### 방법 2: 수동으로 URL 입력

브라우저가 자동으로 열리지 않으면:
1. 터미널에 표시된 URL을 복사
2. 브라우저에 붙여넣기
3. 로그인

---

## ✅ Step 3: 로그인 확인

```bash
gcloud auth list
```

**출력 예시:**
```
ACTIVE  ACCOUNT
*       your-email@gmail.com

To set the active account, run:
  $ gcloud config set account `ACCOUNT`
```

✅ `ACTIVE`로 표시되면 로그인 완료!

---

## 🎯 Step 4: 프로젝트 설정

로그인 후 프로젝트를 설정해야 합니다:

### 방법 1: 수동 설정

```bash
gcloud config set project [YOUR_PROJECT_ID]
```

프로젝트 ID는 Cloud Console에서 확인:
- https://console.cloud.google.com
- 상단 프로젝트 선택 드롭다운에서 확인

### 방법 2: 스크립트 사용

```bash
set-gcp-project.bat
```

---

## 📋 Step 5: 프로젝트 확인

```bash
gcloud config get-value project
```

설정된 프로젝트 ID가 표시됩니다.

---

## 🆘 문제 해결

### 문제 1: "gcloud: command not found"

**해결:**
- gcloud CLI가 설치되지 않았습니다
- 설치 후 **새로운 터미널 창**을 열어야 합니다
- PATH 환경 변수 확인 필요할 수 있음

### 문제 2: "ERROR: (gcloud.auth.login) One of --no-launch-browser"

**해결:**
- 브라우저를 수동으로 열고 URL 입력
- 또는: `gcloud auth login --no-launch-browser`

### 문제 3: "Access Denied" 또는 권한 오류

**해결:**
- Google Cloud 계정이 올바른지 확인
- 프로젝트에 대한 접근 권한이 있는지 확인

### 문제 4: 여러 계정 로그인

**해결:**
```bash
# 모든 계정 목록 보기
gcloud auth list

# 특정 계정으로 전환
gcloud config set account [ACCOUNT_EMAIL]
```

---

## 🎉 완료 확인

모든 설정이 완료되었는지 확인:

```bash
# 로그인 상태 확인
gcloud auth list

# 프로젝트 확인
gcloud config get-value project

# 설정 확인
gcloud config list
```

---

## 📝 빠른 참조

```bash
# 로그인
gcloud auth login

# 로그인 확인
gcloud auth list

# 프로젝트 설정
gcloud config set project [PROJECT_ID]

# 프로젝트 확인
gcloud config get-value project

# 로그아웃 (필요시)
gcloud auth revoke

# 모든 설정 확인
gcloud config list
```

---

## ✅ 다음 단계

로그인 및 프로젝트 설정이 완료되면:

1. **필수 사항 체크**
   ```bash
   check-gcp-prerequisites.bat
   ```

2. **빠진 항목 수정**
   ```bash
   fix-gcp-missing-items.bat
   ```

3. **배포 시작**
   ```bash
   setup-gcp-compute-engine-vm.bat
   setup-gcp-connection-info.bat
   deploy-gcp-compute-engine.bat
   ```



