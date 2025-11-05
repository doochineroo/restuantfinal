# 🔌 DBeaver로 VM 데이터베이스 연결하기

VM(GCP)에 설치된 MySQL 데이터베이스를 DBeaver로 연결하는 방법입니다.

---

## 📋 연결 정보

**VM 설정:**
- 인스턴스 이름: `chopplan-server`
- Zone: `us-west1-a`

**MySQL 데이터베이스 설정:**
- 호스트: `localhost` (VM 내부에서) → **SSH 터널링 필요**
- 포트: `3306`
- 데이터베이스: `chopplan`
- 사용자: `root`
- 비밀번호: `chopplan123`

---

## ✅ 방법 1: DBeaver SSH 터널링 사용 (추천)

### 1단계: VM 외부 IP 확인

```bash
gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

또는 Google Cloud Console에서:
1. **Compute Engine** > **VM 인스턴스**
2. `chopplan-server` 클릭
3. **외부 IP** 확인

---

### 2단계: DBeaver 연결 설정

1. **DBeaver 실행**
2. **새 데이터베이스 연결** (Ctrl+Shift+N)
3. **MySQL** 선택
4. **연결 설정:**

   **일반 탭:**
   ```
   호스트: localhost
   포트: 3306
   데이터베이스: chopplan
   사용자 이름: root
   비밀번호: chopplan123
   ```

   **⚠️ 중요: SSH 탭 설정**
   
   **SSH 탭 클릭:**
   - ✅ **SSH 터널 사용** 체크
   - 호스트: **[VM 외부 IP]** (예: `34.123.45.67`)
   - 포트: `22`
   - 사용자 이름: VM의 사용자명 (보통 `gcp-user` 또는 `ubuntu`)
   - 인증 방법: **공개 키** 또는 **비밀번호**
   
   **공개 키 사용 시:**
   - 키 파일: `C:\Users\[사용자명]\.ssh\google_compute_engine` 또는 `C:\Users\[사용자명]\.ssh\id_rsa`
   - 또는 `gcloud compute config-ssh` 명령으로 생성된 키 사용
   
   **비밀번호 사용 시:**
   - VM에 비밀번호 인증이 설정되어 있어야 함

5. **테스트 연결** 클릭
6. **완료** 클릭

---

## ✅ 방법 2: gcloud CLI로 SSH 터널 생성 후 연결

### 1단계: SSH 터널 생성

**PowerShell에서 실행:**

```powershell
# SSH 터널 생성 (백그라운드 실행)
ssh -N -L 3307:localhost:3306 chopplan-server.us-west1-a.[프로젝트ID] -i ~/.ssh/google_compute_engine
```

또는 gcloud 사용:

```powershell
# gcloud로 SSH 터널 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --ssh-flag="-L 3307:localhost:3306" --ssh-flag="-N"
```

**⚠️ 이 명령은 계속 실행 중이어야 합니다. 새 터미널 창을 열어서 DBeaver를 실행하세요.**

---

### 2단계: DBeaver 연결 설정

1. **DBeaver 실행**
2. **새 데이터베이스 연결** (Ctrl+Shift+N)
3. **MySQL** 선택
4. **연결 설정:**

   **일반 탭:**
   ```
   호스트: localhost
   포트: 3307  (SSH 터널에서 지정한 로컬 포트)
   데이터베이스: chopplan
   사용자 이름: root
   비밀번호: chopplan123
   ```

5. **테스트 연결** 클릭
6. **완료** 클릭

---

## ✅ 방법 3: VM에 직접 SSH 접속 후 MySQL 클라이언트 사용

### 1단계: VM 접속

```bash
gcloud compute ssh chopplan-server --zone=us-west1-a
```

### 2단계: MySQL 접속

```bash
mysql -u root -pchopplan123 chopplan
```

### 3단계: 데이터 확인

```sql
SHOW TABLES;
SELECT COUNT(*) FROM restaurants;
SELECT * FROM restaurants LIMIT 10;
```

---

## 🔍 연결 정보 확인

### application-gcp.properties 파일 확인

```
src/main/resources/application-gcp.properties
```

**설정 내용:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/chopplan?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=chopplan123
```

---

## ❓ 문제 해결

### "Communications link failure" 오류

1. **VM 외부 IP 확인**
   ```bash
   gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
   ```

2. **VM 방화벽 규칙 확인**
   - Google Cloud Console > **VPC 네트워크** > **방화벽 규칙**
   - SSH (포트 22) 허용 확인
   - MySQL (포트 3306)은 외부 접근 차단되어 있어야 함 (SSH 터널링 사용)

3. **SSH 키 확인**
   ```bash
   # SSH 키 생성 (없으면)
   gcloud compute config-ssh
   ```

### "Access denied" 오류

1. **MySQL 비밀번호 확인**
   - VM에서 직접 확인:
   ```bash
   gcloud compute ssh chopplan-server --zone=us-west1-a
   sudo mysql -u root -pchopplan123 -e "SELECT 1;"
   ```

2. **사용자 권한 확인**
   ```sql
   SELECT User, Host FROM mysql.user WHERE User='root';
   ```

### "Connection timeout" 오류

1. **VM이 실행 중인지 확인**
   ```bash
   gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(status)"
   ```
   - 결과가 `RUNNING`이어야 함

2. **MySQL 서비스 확인**
   ```bash
   gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl status mysql"
   ```

---

## ✅ 확인 체크리스트

- [ ] VM 외부 IP 확인
- [ ] DBeaver에서 SSH 터널 설정
- [ ] SSH 키 파일 경로 확인
- [ ] MySQL 데이터베이스 `chopplan` 존재
- [ ] 테스트 연결 성공
- [ ] 테이블 목록 확인 가능

---

## 💡 팁

### 빠른 연결 정보 확인

VM 외부 IP를 빠르게 확인하려면:

```bash
gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

### SSH 키 자동 생성

```bash
gcloud compute config-ssh
```

이 명령은 자동으로 SSH 키를 생성하고 `~/.ssh/config` 파일을 업데이트합니다.

### DBeaver 연결 저장

연결에 이름을 지정하여 저장하면 나중에 쉽게 재사용할 수 있습니다:
- 연결 이름: `VM chopplan-server (SSH)`

---

## 🎯 요약

**VM 데이터베이스 연결 정보:**
```
SSH 터널:
  호스트: [VM 외부 IP]
  포트: 22
  사용자: [gcp-user 또는 ubuntu]
  키: ~/.ssh/google_compute_engine

MySQL:
  호스트: localhost (SSH 터널을 통해)
  포트: 3306
  데이터베이스: chopplan
  사용자: root
  비밀번호: chopplan123
```

**DBeaver 설정:**
- 일반 탭: MySQL 정보 입력
- SSH 탭: SSH 터널 정보 입력
- 테스트 연결 → 완료!

