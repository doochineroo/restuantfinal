# 🚀 ChopPlan 수동 배포 가이드

**Google Cloud Compute Engine VM 배포 (Always Free 티어)**

## ⚠️ 중요: 작업 디렉토리

이 가이드는 `choprest` 폴더 (백엔드) 내부, 즉 **`C:\yonsai\chopplan\choprest`** 디렉터리에서 모든 명령어를 실행하는 것을 기준으로 합니다.

**현재 위치 확인:**
```bash
# 현재 위치가 C:\yonsai\chopplan\choprest 인지 확인
pwd
```

---

## 📋 사전 준비사항

1. ✅ Google Cloud 프로젝트 생성 및 설정 완료
2. ✅ `gcloud` CLI 설치 및 로그인 완료
3. ✅ VM 인스턴스 생성 완료 (이름: `chopplan-server`, 리전: `us-west1-a`)
4. ✅ VM 내부 MySQL 설치 완료

---

## 🛠️ Step 1: 백엔드 빌드

### 1-1. 로컬에서 빌드

```bash
# C:\yonsai\chopplan\choprest 디렉터리에서 실행
gradlew.bat clean build
```

**빌드 결과물:**
- `build/libs/choprest-0.0.1-SNAPSHOT.jar`

### 1-2. 빌드 확인

```bash
# JAR 파일 확인
dir build\libs\choprest-0.0.1-SNAPSHOT.jar
```

---

## 🎨 Step 2: 프론트엔드 빌드

### 2-1. 환경변수 확인

`..\frontend\.env.production` 파일이 있는지 확인:

```env
REACT_APP_API_BASE_URL=http://136.117.47.204:8080/api
PUBLIC_URL=/
```

**없으면 생성:**

```bash
cd ..\frontend
echo REACT_APP_API_BASE_URL=http://136.117.47.204:8080/api > .env.production
echo PUBLIC_URL=/ >> .env.production
cd ..\choprest
```

### 2-2. 프론트엔드 빌드

```bash
cd ..\frontend
npm run build
cd ..\choprest
```

**빌드 결과물:**
- `..\frontend\build\` 디렉토리 전체

### 2-3. 빌드 확인

```bash
# 빌드 파일 확인
dir ..\frontend\build
```

---

## 📤 Step 3: 파일 업로드

### 3-0. 디렉토리 생성 (처음 배포 시 필수!)

```bash
# VM에 디렉토리 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mkdir -p ~/chopplan/static"
```

### 3-1. JAR 파일 업로드

```bash
# C:\yonsai\chopplan\choprest 에서 실행
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a
```

### 3-2. 프론트엔드 파일 업로드

```bash
# 프론트엔드 빌드 파일 전체 업로드
gcloud compute scp --recurse ..\frontend\build\* chopplan-server:chopplan/static/ --zone=us-west1-a
```

**업로드 위치:**
- JAR: `~/chopplan/choprest-0.0.1-SNAPSHOT.jar`
- 프론트엔드: `~/chopplan/static/`

---

## 🔄 Step 4: 애플리케이션 실행

### 4-1. 기존 프로세스 종료

```bash
gcloud compute ssh chopplan-server --zone=us-west1-a --command="pkill -f java"
```

### 4-2. 애플리케이션 실행

```bash
gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"
```

### 4-3. 실행 확인

```bash
# 프로세스 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="ps aux | grep java"

# 로그 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="tail -f ~/chopplan/app.log"
```

---

## 🔥 Step 5: 방화벽 규칙 확인

### 5-1. 방화벽 규칙 확인

```bash
gcloud compute firewall-rules list --filter="name=allow-http-8080"
```

### 5-2. 없으면 생성

```bash
gcloud compute firewall-rules create allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP port 8080"
```

---

## ✅ Step 6: 배포 확인

### 6-1. 외부 IP 확인

```bash
gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

**예상 결과:** `136.117.47.204`

### 6-2. API 테스트

브라우저에서 접속:
```
http://136.117.47.204:8080/api/restaurants?keyword=맥도날드
```

### 6-3. 프론트엔드 테스트

브라우저에서 접속:
```
http://136.117.47.204:8080
```

---

## 🔄 Step 7: 애플리케이션 업데이트 (재배포)

코드 수정 후 재배포 (마찬가지로 `C:\yonsai\chopplan\choprest` 에서 실행):

### 7-1. 백엔드 재배포

```bash
# 1. 빌드
gradlew.bat clean build

# 2. JAR 업로드
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a

# 3. 애플리케이션 재시작
gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"
```

### 7-2. 프론트엔드 재배포

```bash
# 1. 빌드
cd ..\frontend
npm run build
cd ..\choprest

# 2. 파일 업로드
gcloud compute scp --recurse ..\frontend\build\* chopplan-server:chopplan/static/ --zone=us-west1-a

# 3. 애플리케이션 재시작 (필요시 - 보통 프론트만 바꾸면 재시작 안해도 됨)
# gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"
```

---

## 📊 전체 배포 명령어 요약

### 처음 배포 시

```bash
# 0. (필수) C:\yonsai\chopplan\choprest 에서 실행

# 1. VM 디렉토리 생성 (처음 한 번만)
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mkdir -p ~/chopplan/static"

# 2. 백엔드 빌드
gradlew.bat clean build

# 3. 프론트엔드 빌드
cd ..\frontend
npm run build
cd ..\choprest

# 4. 파일 업로드
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a
gcloud compute scp --recurse ..\frontend\build\* chopplan-server:chopplan/static/ --zone=us-west1-a

# 5. 애플리케이션 실행
gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"
```

### 업데이트 시

```bash
# 백엔드만 업데이트 (C:\yonsai\chopplan\choprest 에서 실행)
gradlew.bat clean build
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a
gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"

# 프론트엔드만 업데이트 (C:\yonsai\chopplan\choprest 에서 실행)
cd ..\frontend
npm run build
cd ..\choprest
gcloud compute scp --recurse ..\frontend\build\* chopplan-server:chopplan/static/ --zone=us-west1-a
```

---

## 🔍 문제 해결

### 로그 확인

```bash
# 실시간 로그 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="tail -f ~/chopplan/app.log"

# 최근 50줄 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="tail -50 ~/chopplan/app.log"
```

### 프로세스 확인

```bash
# Java 프로세스 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="ps aux | grep java"

# 포트 사용 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="netstat -tulpn | grep 8080"
```

### MySQL 상태 확인

```bash
# MySQL 서비스 상태
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl status mysql"

# MySQL 연결 테스트
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo mysql -u root -pchopplan123 -e 'SHOW DATABASES;'"
```

---

## 🌐 접속 정보

- **프론트엔드**: `http://136.117.47.204:8080`
- **백엔드 API**: `http://136.117.47.204:8080/api`
- **데이터베이스**: VM 내부 MySQL (localhost:3306)

---

## ⚠️ 주의사항

1. **VM 외부 IP 변경**: VM을 재생성하면 외부 IP가 변경될 수 있습니다.
   - `..\frontend\.env.production` 파일 업데이트 필요
   - `apiConfig.js` 기본값 업데이트 필요

2. **데이터 백업**: VM 내부 MySQL 데이터는 정기적으로 백업하세요.
   ```bash
   gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysqldump -u root -pchopplan123 chopplan > ~/chopplan_backup.sql"
   ```

3. **방화벽 규칙**: 포트 8080이 열려있는지 확인하세요.

---

**✅ 이제 수동으로 배포할 수 있습니다!**
