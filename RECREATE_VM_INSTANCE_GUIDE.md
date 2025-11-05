# 🔄 VM 인스턴스 삭제 및 재생성 가이드

VM 인스턴스에 문제가 있거나 새로 시작하고 싶을 때 사용하는 가이드입니다.

---

## ⚠️ 주의사항

**인스턴스를 삭제하면 모든 데이터가 영구적으로 삭제됩니다!**

삭제 전에 반드시 백업을 받으세요:
- 데이터베이스 백업
- 애플리케이션 파일 백업
- 설정 파일 백업

---

## ✅ 방법 1: 자동 스크립트 사용 (추천)

```bash
recreate-vm-instance.bat
```

이 스크립트가 자동으로:
1. 기존 인스턴스 삭제
2. 새 인스턴스 생성
3. 초기 설정 (Java, MySQL 설치)
4. 디렉토리 생성

---

## ✅ 방법 2: 수동으로 삭제 및 재생성

### Step 1: 데이터 백업

**데이터베이스 백업:**
```bash
# VM에서 백업 생성
gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="mysqldump -u root -pchopplan123 chopplan > ~/chopplan_backup.sql"

# 로컬로 다운로드
gcloud compute scp chopplan-server:~/chopplan_backup.sql . --zone=us-west1-a
```

**애플리케이션 파일 백업 (선택사항):**
```bash
gcloud compute scp chopplan-server:~/chopplan/*.jar . --zone=us-west1-a
```

---

### Step 2: 기존 인스턴스 삭제

```bash
gcloud compute instances delete chopplan-server --zone=us-west1-a
```

확인 메시지가 나오면 `y` 입력

---

### Step 3: 새 인스턴스 생성

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

### Step 4: 초기 설정

**Java 설치:**
```bash
gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="sudo apt update && sudo apt upgrade -y && sudo apt install openjdk-17-jdk -y"
```

**MySQL 설치:**
```bash
gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="sudo apt install mysql-server -y"
```

**MySQL 초기 설정:**
```bash
# 비밀번호 설정
gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="sudo mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'chopplan123';\""

gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="sudo mysql -e \"FLUSH PRIVILEGES;\""

# 데이터베이스 생성
gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="sudo mysql -u root -pchopplan123 -e 'CREATE DATABASE chopplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'"
```

**디렉토리 생성:**
```bash
gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="mkdir -p ~/chopplan/static"
```

---

### Step 5: 데이터베이스 복원 (백업이 있다면)

```bash
# 백업 파일 업로드
gcloud compute scp chopplan_backup.sql chopplan-server:~/ --zone=us-west1-a

# 데이터베이스 복원
gcloud compute ssh chopplan-server --zone=us-west1-a \
    --command="mysql -u root -pchopplan123 chopplan < ~/chopplan_backup.sql"
```

---

### Step 6: 애플리케이션 배포

```bash
# 자동 배포 스크립트 사용
deploy-gcp-compute-engine.bat

# 또는 빠른 업로드
fast-upload.bat
```

---

## 🔍 언제 새 인스턴스를 만들까?

### ✅ 새 인스턴스 생성이 좋은 경우:

1. **Network Management API 오류** - API 활성화보다 새로 만드는 게 빠를 수 있음
2. **IAM 권한 오류** - 권한 설정이 복잡할 때
3. **설정이 꼬인 경우** - 여러 설정을 시도하다가 복잡해진 경우
4. **처음부터 깔끔하게 시작** - 테스트 환경을 새로 만들고 싶을 때
5. **비용 절감** - 새 인스턴스로 필요한 설정만 다시 하는 게 효율적

### ❌ 기존 인스턴스 유지가 좋은 경우:

1. **중요한 데이터가 있음** - 백업이 없거나 복원이 어려운 경우
2. **설정이 완료됨** - 오류만 해결하면 되는 경우
3. **시간이 오래 걸림** - 새로 만들고 설정하는 시간이 아까운 경우

---

## 💡 빠른 비교

| 방법 | 시간 | 난이도 | 추천 |
|------|------|--------|------|
| **새 인스턴스 생성** | 5-10분 | ⭐ 쉬움 | ✅ 오류 해결이 복잡할 때 |
| **API/권한 수정** | 2-5분 | ⭐⭐ 보통 | ✅ 간단한 오류일 때 |

---

## 📋 체크리스트

### 삭제 전:
- [ ] 데이터베이스 백업 완료
- [ ] 애플리케이션 파일 백업 (필요시)
- [ ] 외부 IP 주소 기록 (필요시)
- [ ] 방화벽 규칙 확인 (삭제되지 않음)

### 재생성 후:
- [ ] Java 설치 확인: `java -version`
- [ ] MySQL 설치 확인: `mysql --version`
- [ ] 데이터베이스 복원 완료
- [ ] 애플리케이션 배포 완료
- [ ] 방화벽 규칙 확인 (포트 8080)
- [ ] 애플리케이션 실행 확인

---

## ❓ 문제 해결

### 인스턴스 삭제 실패

**오류: "The instance resource is not ready"**
- 인스턴스가 실행 중이면 중지 후 삭제:
  ```bash
  gcloud compute instances stop chopplan-server --zone=us-west1-a
  gcloud compute instances delete chopplan-server --zone=us-west1-a
  ```

### 새 인스턴스 생성 실패

**오류: "Quota exceeded"**
- 기존 인스턴스가 완전히 삭제될 때까지 대기 (1-2분)
- 또는 다른 리전 사용

**오류: "API not enabled"**
- `fix-vm-network-iam-errors.bat` 실행
- 또는 Compute Engine API 활성화:
  ```bash
  gcloud services enable compute.googleapis.com
  ```

---

## ✅ 요약

**새 인스턴스 생성의 장점:**
- ✅ 깔끔한 시작
- ✅ 오류 해결 시간 단축
- ✅ 설정이 간단함

**권장:**
- 오류가 복잡하거나 시간이 없을 때 → **새 인스턴스 생성**
- 간단한 오류일 때 → **기존 인스턴스 수정**

---

## 🚀 빠른 시작

```bash
# 1. 백업 (선택사항)
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysqldump -u root -pchopplan123 chopplan > ~/chopplan_backup.sql"
gcloud compute scp chopplan-server:~/chopplan_backup.sql . --zone=us-west1-a

# 2. 재생성 스크립트 실행
recreate-vm-instance.bat

# 3. 데이터베이스 복원 (백업이 있다면)
gcloud compute scp chopplan_backup.sql chopplan-server:~/ --zone=us-west1-a
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysql -u root -pchopplan123 chopplan < ~/chopplan_backup.sql"

# 4. 애플리케이션 배포
deploy-gcp-compute-engine.bat
```

