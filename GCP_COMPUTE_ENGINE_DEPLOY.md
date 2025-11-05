# 🚀 Google Cloud Compute Engine 배포 가이드 (AWS EC2와 동일)

## 📋 Step 1: VM 인스턴스 생성

### 1-1. Compute Engine 접속

1. **Google Cloud Console** 접속: https://console.cloud.google.com
2. 좌측 메뉴: **Compute Engine** > **VM 인스턴스**

### 1-2. 인스턴스 만들기

1. **인스턴스 만들기** 클릭
2. 설정:
   ```
   이름: chopplan-server
   리전: us-west1 (미국 서부 - Always Free 티어) 
      또는 asia-northeast2 (서울 - 유료)
   머신 구성:
     - 시리즈: E2
     - 머신 유형: e2-micro (공유 코어, 1GB)
   
   부팅 디스크:
     - 운영체제: Ubuntu 22.04 LTS
     - 크기: 30GB (Always Free에 포함)
   
   방화벽:
     - ✅ HTTP 트래픽 허용
     - ✅ HTTPS 트래픽 허용
   ```
3. **만들기** 클릭

### 1-3. 외부 IP 확인

1. 인스턴스 생성 후
2. **외부 IP** 확인 (예: `34.xxx.xxx.xxx`)

---

## 📋 Step 2: SSH 연결

### 2-1. 브라우저에서 SSH

1. 인스턴스 목록에서 **SSH** 버튼 클릭
2. 브라우저에서 터미널 열림

### 2-2. 또는 로컬에서 SSH

```bash
# SSH 키 생성 (처음 한 번만)
gcloud compute ssh chopplan-server --zone=us-west1-a

# 또는 직접 SSH (공개 키 설정 후)
ssh -i ~/.ssh/google_compute_engine [USERNAME]@[EXTERNAL_IP]
```

---

## 📋 Step 3: 서버 설정

### 3-1. 필수 패키지 설치

**SSH 접속 후:**
```bash
# 시스템 업데이트
sudo apt update
sudo apt upgrade -y

# Java 17 설치
sudo apt install openjdk-17-jdk -y

# Java 버전 확인
java -version
```

### 3-2. 애플리케이션 디렉토리 생성

```bash
mkdir -p ~/chopplan
cd ~/chopplan
```

---

## 📋 Step 4: 애플리케이션 배포

### 4-1. 로컬에서 빌드

**Windows:**
```bash
gradlew.bat clean build
```

### 4-2. JAR 파일 업로드

**방법 A: gcloud CLI 사용**

```bash
# 로컬에서
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a
```

**방법 B: SCP 사용 (키 설정 후)**

```bash
scp -i ~/.ssh/google_compute_engine build/libs/choprest-0.0.1-SNAPSHOT.jar [USERNAME]@[EXTERNAL_IP]:~/chopplan/
```

**방법 C: Cloud Storage 경유**

1. JAR 파일을 Cloud Storage에 업로드
2. VM에서 gsutil로 다운로드

### 4-3. application-gcp.properties 업데이트

**로컬에서:**
```properties
spring.datasource.url=jdbc:mysql://[CLOUD_SQL_IP]:3306/chopplan?useSSL=true&serverTimezone=Asia/Seoul
spring.datasource.username=root
spring.datasource.password=[GCP_PASSWORD]
```

### 4-4. 실행

**VM에서:**
```bash
cd ~/chopplan
nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &

# 로그 확인
tail -f app.log
```

---

## 📋 Step 5: 방화벽 규칙 설정

### 5-1. HTTP/HTTPS 포트 열기

**Cloud Console에서:**
1. **VPC 네트워크** > **방화벽 규칙**
2. **방화벽 규칙 만들기**:
   ```
   이름: allow-http-8080
   방향: 수신
   작업: 허용
   대상: 네트워크의 모든 인스턴스
   소스 IP 범위: 0.0.0.0/0
   프로토콜 및 포트: TCP, 8080
   ```
3. **만들기**

---

## 📋 Step 6: 배포 자동화 스크립트

### deploy-gcp-compute-engine.bat (Windows)

```batch
@echo off
REM Google Cloud Compute Engine 배포 스크립트

echo 🚀 GCP Compute Engine 배포 시작...

REM 1. 백엔드 빌드
echo 📦 백엔드 빌드 중...
call gradlew.bat clean build

REM 2. JAR 파일 업로드
echo 📤 JAR 파일 업로드 중...
gcloud compute scp build\libs\choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a

REM 3. 애플리케이션 재시작
echo 🔄 애플리케이션 재시작 중...
gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"

echo ✅ 배포 완료!
echo 🌐 서버 주소: http://[EXTERNAL_IP]:8080
```

---

## 💰 비용 요약

### Always Free 티어 사용 시:

- **e2-micro 인스턴스**: 무료 (월 1개)
- **스토리지 30GB**: 무료
- **네트워크**: 거의 무료
- **총 비용**: 거의 $0/월 ✅

### 한국 리전 사용 시:

- **e2-micro**: 약 $10-15/월
- **$300 크레딧**: 20-30개월 무료!

---

## ✅ 결론

**충분히 가능하고 무료로 사용 가능합니다!**

- ✅ Always Free 티어로 거의 무료
- ✅ AWS EC2와 동일한 방식
- ✅ 현재 애플리케이션에 충분한 성능

**지금 바로 배포 가능합니다!** 🚀


