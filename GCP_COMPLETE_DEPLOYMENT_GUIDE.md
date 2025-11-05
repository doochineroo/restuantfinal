# 🚀 Google Cloud 완전 무료 배포 가이드 (Always Free 티어)

## ✅ 진짜 과금 없이 사이트 운영하기!

이 가이드는 **Google Cloud Always Free 티어만 사용**하여 백엔드와 프론트엔드를 모두 배포하고, **실시간 예약 시스템**을 운영하는 방법을 안내합니다.

**💰 비용: $0/월 (완전 무료!)**  
**🚀 $300 크레딧: 거의 사용 안 됨! (크레딧 만료 후에도 계속 무료!)**

---

## 🎯 핵심 전략 - 크레딧 최대한 아끼기

**과금 없이 사용하는 방법:**
1. ✅ **Compute Engine e2-micro** (Always Free 티어)
2. ✅ **VM 내부에 MySQL 설치** (Cloud SQL 대신 - Cloud SQL은 월 $10-15!)
3. ✅ **Always Free 리전 사용** (us-west1, us-central1, us-east1)
4. ✅ **실시간 예약 시스템 완벽 지원** (localhost 연결로 즉시 반영)

---

## 📊 빠른 비교

| 항목 | VM 내부 MySQL (이 가이드) | Cloud SQL |
|------|-------------------------|-----------|
| **월 비용** | **$0 (무료)** | $10-15/월 |
| **응답 속도** | **매우 빠름 (localhost)** | 빠름 (네트워크) |
| **실시간 반영** | **✅ 즉시 반영** | ✅ 즉시 반영 |
| **크레딧 사용** | **거의 없음** | 월 $10-15 |
| **크레딧 만료 후** | **계속 무료** | $10-15/월 과금 |
| **관리** | 수동 설정 필요 | 자동 관리 |

**✅ 결론: VM 내부 MySQL 사용이 크레딧 절약과 실시간 반영 모두에 최적입니다!**

---

## 📋 사전 준비사항

### 1. Google Cloud 계정 및 프로젝트
- ✅ Google Cloud 계정 생성 완료
- ✅ 프로젝트 생성 완료
- ⚠️ **결제 계정 연결 필요** (Always Free 티어 사용을 위해 필요하지만 과금되지 않음)

### 2. 로컬 개발 환경
- ✅ gcloud CLI 설치 및 로그인
- ✅ Java 17 설치 (로컬 빌드용)
- ✅ Node.js 설치 (로컬 빌드용)

---

## 🎯 Step 1: Compute Engine VM 생성 (Always Free 티어)

### ⚠️ 중요: Always Free 티어 조건

**무료로 사용하려면 반드시 다음 조건을 지켜야 합니다:**
- ✅ **리전**: `us-west1`, `us-central1`, 또는 `us-east1` (한국 리전은 유료!)
- ✅ **머신 유형**: `e2-micro` (더 큰 것은 유료)
- ✅ **디스크 크기**: 30GB 이하 (Always Free에 포함)
- ✅ **월 1개 인스턴스만** 무료 (여러 개 생성하면 유료)

### 1-1. Cloud Console에서 생성

1. **Compute Engine** > **VM 인스턴스**
2. **인스턴스 만들기** 클릭
3. 설정:
   ```
   이름: chopplan-server
   리전: us-west1 (Always Free 티어) ⚠️ 필수!
   영역: us-west1-a
   머신 유형: e2-micro (1 vCPU, 1GB RAM) ⚠️ 필수!
   
   부팅 디스크:
     - 운영체제: Ubuntu 22.04 LTS
     - 크기: 30GB (Always Free에 포함)
   
   방화벽:
     - ✅ HTTP 트래픽 허용
     - ✅ HTTPS 트래픽 허용
   ```
4. **만들기** 클릭

### 1-2. 또는 gcloud CLI로 생성

```bash
gcloud compute instances create chopplan-server \
    --zone=us-west1-a \
    --machine-type=e2-micro \
    --boot-disk-size=30GB \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --tags=http-server,https-server
```

**⚠️ 주의: 리전을 항상 `us-west1-a`로 설정해야 무료입니다!**

---

## 🔧 Step 2: VM 초기 설정 (Java + MySQL 설치)

### 2-1. 로컬에서 원격 명령어 실행 방법

**⚠️ 모든 명령어는 로컬 컴퓨터(Windows PowerShell/CMD)에서 실행하세요!**

**기본 형식:**
```bash
gcloud compute ssh chopplan-server --zone=us-west1-a --command="명령어"
```

**장점:**
- ✅ 로컬 컴퓨터에서 한 번에 실행 가능
- ✅ VM 내부에서 직접 접속할 필요 없음
- ✅ 명령어 복사/붙여넣기로 쉽게 실행
- ✅ 스크립트 자동화 가능

**처음 실행 시:**
- SSH 키가 자동으로 생성됨
- 키 생성 확인 메시지 표시
- `yes` 입력하면 계속 진행됨

### 2-1-1. 로컬에서 인증 오류 해결

**오류 메시지:**
```
WARNING: Some requests did not succeed.
- Request had insufficient authentication scopes.
```

**해결 방법:**

1. **Compute Engine API 활성화 (필수!)**
   ```bash
   gcloud services enable compute.googleapis.com
   ```

2. **애플리케이션 기본 인증서 재설정**
   ```bash
   gcloud auth application-default login
   ```

3. **프로젝트 확인**
   ```bash
   gcloud config get-value project
   gcloud config set project [YOUR_PROJECT_ID]  # 필요시
   ```

4. **인스턴스 상태 확인**
   ```bash
   gcloud compute instances list
   ```

### 2-2. 시스템 업데이트 및 필수 패키지 설치 (로컬에서 실행)

**⚠️ 이 명령어들은 로컬 컴퓨터(Windows PowerShell/CMD)에서 실행하세요!**

**로컬 컴퓨터에서 한 번에 실행:**

```bash
# 1. 시스템 업데이트 및 Java 17 설치
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt update && sudo apt upgrade -y && sudo apt install openjdk-17-jdk -y"

# 2. MySQL 설치 (VM 내부에 설치 - Cloud SQL 대신!)
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt install mysql-server -y"

# 3. 디렉토리 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mkdir -p ~/chopplan/static"

# 4. 설치 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="java -version && mysql --version"
```

**또는 개별적으로 실행:**

```bash
# 시스템 업데이트
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt update"

# 시스템 업그레이드
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt upgrade -y"

# Java 17 설치
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt install openjdk-17-jdk -y"

# MySQL 설치
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt install mysql-server -y"

# 디렉토리 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mkdir -p ~/chopplan/static"

# 설치 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="java -version"
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysql --version"
```

**✅ 로컬 컴퓨터에서 실행하면 VM 내부에서 자동으로 설치됩니다!**

### 2-3. MySQL 초기 설정 (로컬에서 실행)

**로컬 컴퓨터에서 실행:**

```bash
# MySQL root 비밀번호 설정
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'chopplan123';\""

# 권한 적용
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo mysql -e \"FLUSH PRIVILEGES;\""

# MySQL 서비스 시작 및 자동 시작 설정
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl start mysql && sudo systemctl enable mysql"

# MySQL 서비스 상태 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl status mysql"
```

### 2-4. 데이터베이스 생성 (로컬에서 실행)

**로컬 컴퓨터에서 실행:**

```bash
# 데이터베이스 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo mysql -u root -pchopplan123 -e 'CREATE DATABASE chopplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'"

# 데이터베이스 생성 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo mysql -u root -pchopplan123 -e 'SHOW DATABASES;'"
```

**✅ 로컬에서 실행하면 VM 내부에서 자동으로 설정됩니다!**

**✅ 이제 VM 내부에 MySQL이 설치되었습니다! Cloud SQL은 사용하지 않으므로 크레딧 절약!**

### ⚠️ 중요: 데이터 저장 위치 및 지속성

**VM 내부 MySQL의 데이터 저장:**
- ✅ **저장 위치**: VM의 부팅 디스크 (30GB 디스크)
- ✅ **데이터 반영**: **즉시 반영됩니다!**
  - 애플리케이션과 MySQL이 같은 VM에서 실행
  - `localhost`로 연결하므로 네트워크 지연 없음
  - 데이터 변경 시 즉시 디스크에 저장

**데이터 지속성:**
- ✅ **VM 실행 중**: 데이터는 계속 유지됨
- ✅ **VM 재시작**: 데이터는 유지됨 (디스크에 저장되어 있음)
- ⚠️ **VM 삭제**: **데이터도 함께 삭제됨!** (백업 필수!)
- ⚠️ **디스크 삭제**: 데이터 손실

**Cloud SQL과의 차이:**
| 항목 | VM 내부 MySQL | Cloud SQL |
|------|--------------|-----------|
| 데이터 저장 | VM 디스크 | 독립 스토리지 |
| 즉시 반영 | ✅ 예 (동일 VM) | ✅ 예 |
| 응답 속도 | ✅ 매우 빠름 (localhost) | ✅ 빠름 (네트워크) |
| 동시성 처리 | ✅ MySQL 트랜잭션 지원 | ✅ 동일 |
| 실시간 예약 | ✅ 문제 없음 | ✅ 문제 없음 |
| VM 삭제 시 | ❌ 데이터 손실 | ✅ 데이터 유지 |
| 자동 백업 | ❌ 수동 설정 필요 | ✅ 자동 백업 |
| 데이터 복구 | 수동 복구 | 자동 복구 |

### ✅ 실시간 예약 시스템에 적합한 이유

**VM 내부 MySQL은 실시간 예약 시스템에 완벽하게 적합합니다:**

1. **즉시 반영**
   - 애플리케이션과 MySQL이 같은 VM에서 실행
   - `localhost` 연결로 네트워크 지연 거의 없음 (0.1ms 이하)
   - 트랜잭션 커밋 시 즉시 디스크에 저장

2. **동시성 처리**
   - MySQL의 트랜잭션 격리 수준으로 동시 접근 처리
   - `@Transactional` 어노테이션으로 데이터 일관성 보장
   - 여러 사용자가 동시에 예약해도 문제없음

3. **응답 속도**
   - Cloud SQL 대비 더 빠름 (네트워크 지연 없음)
   - 예약 요청 → 저장 → 응답: 수십 밀리초 이내

4. **실제 사용 사례**
   - 예약 생성: 즉시 DB에 저장되고 즉시 조회 가능
   - 예약 수정: 즉시 반영
   - 예약 조회: 최신 데이터 즉시 반영

**⚠️ 주의사항:**
- VM이 다운되면 서비스 중단 (백업 필수)
- 디스크가 가득 차면 문제 발생 가능 (정기 모니터링 필요)

---

## 🔗 Step 3: 데이터베이스 연결 설정 (VM 내부 MySQL)

### 3-1. application-gcp.properties 파일 생성/수정

**로컬에서 파일 생성:**

`src/main/resources/application-gcp.properties` 파일을 생성하고 다음 내용을 입력:

```properties
# VM 내부 MySQL 연결 (localhost 사용)
spring.datasource.url=jdbc:mysql://localhost:3306/chopplan?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul
spring.datasource.username=root
spring.datasource.password=chopplan123

# JPA 설정
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# 로깅
logging.level.root=WARN
logging.level.org.springframework=WARN
```

**✅ 중요: `localhost`를 사용합니다! VM 내부에 MySQL이 설치되어 있기 때문입니다.**

### 3-1-1. 실시간 예약 시스템을 위한 추가 설정

**예약 내역이 즉시 반영되도록 설정:**

```properties
# VM 내부 MySQL 연결 (localhost 사용)
spring.datasource.url=jdbc:mysql://localhost:3306/chopplan?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul
spring.datasource.username=root
spring.datasource.password=chopplan123

# JPA 설정 - 실시간 반영을 위한 최적화
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# 트랜잭션 즉시 커밋 (실시간 반영)
spring.jpa.properties.hibernate.flush_mode=commit
spring.jpa.properties.hibernate.jdbc.batch_size=20

# MySQL 트랜잭션 격리 수준 (동시성 처리)
spring.datasource.hikari.transaction-isolation=TRANSACTION_READ_COMMITTED

# 커넥션 풀 설정 (실시간 처리 최적화)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000

# 로깅
logging.level.root=WARN
logging.level.org.springframework=WARN
logging.level.org.hibernate.SQL=DEBUG  # 개발 시에만 활성화
```

**✅ 이 설정으로 예약 내역이 즉시 반영됩니다!**

### 3-2. 데이터베이스 데이터 마이그레이션 (로컬에서)

로컬에 데이터가 있다면 VM으로 전송:

```bash
# 로컬에서 데이터베이스 덤프
mysqldump -u root -p chopplan > chopplan_backup.sql

# VM으로 파일 전송
gcloud compute scp chopplan_backup.sql chopplan-server:~/ --zone=us-west1-a

# VM에서 데이터 복원
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysql -u root -pchopplan123 chopplan < ~/chopplan_backup.sql"
```

**또는 SQL 파일이 있다면:**

```bash
# SQL 파일을 VM으로 전송
gcloud compute scp chopplan_backup.sql chopplan-server:~/ --zone=us-west1-a

# VM에서 실행
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysql -u root -pchopplan123 chopplan < ~/chopplan_backup.sql"
```

---

## 🚀 Step 4: 애플리케이션 배포

### 4-1. 전체 자동 배포 (추천)

**Windows:**
```bash
deploy-gcp-compute-engine.bat
```

이 스크립트가 다음을 자동으로 수행합니다:
1. ✅ 백엔드 빌드
2. ✅ 프론트엔드 빌드
3. ✅ JAR 파일 업로드
4. ✅ 프론트엔드 파일 업로드
5. ✅ 애플리케이션 재시작

### 4-2. 수동 배포

#### 4-2-1. 백엔드 빌드
```bash
gradlew.bat clean build
```

#### 4-2-2. 프론트엔드 빌드
```bash
cd frontend
npm run build
cd ..
```

#### 4-2-3. 파일 업로드
```bash
# JAR 파일 업로드
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a

# 프론트엔드 파일 업로드
gcloud compute scp --recurse frontend/build/* chopplan-server:chopplan/static/ --zone=us-west1-a
```

#### 4-2-4. 애플리케이션 실행 (로컬에서 실행)

**로컬 컴퓨터에서 실행:**

```bash
# 애플리케이션 실행
gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"

# 실행 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="ps aux | grep java"

# 로그 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="tail -f ~/chopplan/app.log"
```

---

## 🔥 Step 5: 방화벽 규칙 설정

### 5-1. Cloud Console에서 설정

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

### 5-2. gcloud CLI로 설정

```bash
gcloud compute firewall-rules create allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP port 8080"
```

---

## ✅ Step 6: 배포 확인

### 6-1. 서버 상태 확인 (로컬에서 실행)

**로컬 컴퓨터에서 실행:**

```bash
# 외부 IP 확인
gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"

# 로그 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="tail -20 ~/chopplan/app.log"

# 프로세스 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="ps aux | grep java"
```

### 6-2. API 테스트

브라우저에서:
```
http://[EXTERNAL_IP]:8080/api/restaurants?keyword=맥도날드
```

### 6-3. 프론트엔드 테스트

브라우저에서:
```
http://[EXTERNAL_IP]:8080
```

---

## 🔄 Step 7: 애플리케이션 업데이트

### 7-1. 자동 업데이트

```bash
deploy-gcp-compute-engine.bat
```

### 7-2. 수동 업데이트 (로컬에서 실행)

**로컬 컴퓨터에서 실행:**

1. 코드 수정
2. 빌드
3. 파일 업로드 (Step 4-2-3 참고)
4. 애플리케이션 재시작:
   ```bash
   gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"
   ```

---

## 📊 요약: 전체 배포 순서

1. ✅ **Compute Engine VM 생성** (Step 1) - Always Free 티어!
2. ✅ **VM 초기 설정** (Step 2) - Java + MySQL 설치
3. ✅ **데이터베이스 연결 설정** (Step 3) - VM 내부 MySQL 사용
4. ✅ **애플리케이션 배포** (Step 4) - 빌드 및 업로드
5. ✅ **방화벽 규칙 설정** (Step 5) - 포트 8080 열기
6. ✅ **배포 확인** (Step 6) - 테스트

**⚠️ Cloud SQL은 사용하지 않습니다! VM 내부 MySQL 사용으로 크레딧 절약!**

---

## 💰 비용 분석 - 크레딧 최대한 아끼기 전략

### ✅ Always Free 티어로 완전 무료 사용 가능!

**월 비용: $0/월 (완전 무료!)**

| 항목 | Always Free | 크레딧 사용 | 비고 |
|------|-------------|------------|------|
| **Compute Engine e2-micro** | ✅ 무료 | $0 | us-west1, us-central1, us-east1 |
| **디스크 30GB** | ✅ 무료 | $0 | Always Free 포함 |
| **VM 내부 MySQL** | ✅ 무료 | $0 | 별도 서비스 아님 |
| **네트워크 (아웃바운드)** | ✅ 무료 | $0 | Always Free (1GB/월) |
| **방화벽 규칙** | ✅ 무료 | $0 | Always Free |

**총 비용: $0/월** 🎉

### 💡 크레딧 절약 팁

**$300 크레딧을 최대한 아끼려면:**

1. ✅ **Always Free 티어 조건 준수**
   - 리전: `us-west1`, `us-central1`, `us-east1`만 사용
   - 머신 유형: `e2-micro`만 사용
   - 디스크: 30GB 이하

2. ✅ **Cloud SQL 사용 안 함**
   - VM 내부에 MySQL 설치 (이 가이드 방식)
   - Cloud SQL은 월 $7-10 소요 → 크레딧 절약!

3. ✅ **불필요한 서비스 사용 안 함**
   - Cloud Storage, Cloud CDN 등 유료 서비스 사용 안 함
   - 기본 네트워크만 사용

4. ✅ **비용 모니터링**
   ```bash
   # 현재 프로젝트 비용 확인
   gcloud billing accounts list
   gcloud billing projects list --billing-account=[BILLING_ACCOUNT_ID]
   ```

### 📊 Cloud SQL 비용 상세 분석

**Cloud SQL을 사용할 경우 (db-f1-micro 기준):**

| 항목 | 비용 | 설명 |
|------|------|------|
| **인스턴스 (db-f1-micro)** | $7-10/월 | 가장 작은 인스턴스 (0.6GB RAM, 공유 vCPU 1개) |
| **스토리지 (최소 10GB)** | $1.7/월 | $0.17/GB/월 × 10GB |
| **네트워크 (외부 트래픽)** | ~$0.1-0.5/월 | $0.12/GB (데이터가 작으면 거의 무료) |
| **백업** | $0.85/월 | 자동 백업 (스토리지의 50% 추가) |
| **총 비용** | **약 $10-15/월** | |

**리전별 차이:**
- `us-west1` (미국 서부): 약 $10/월
- `asia-northeast2` (서울): 약 $12-15/월 (약간 더 비쌈)

**$300 크레딧 사용 기간:**
- **약 20-30개월** 무료 사용 가능

**VM 내부 MySQL vs Cloud SQL 비교:**

| 항목 | VM 내부 MySQL | Cloud SQL |
|------|--------------|-----------|
| **월 비용** | $0 (무료) | $10-15/월 |
| **관리** | 수동 관리 필요 | 자동 관리 |
| **백업** | 수동 설정 필요 | 자동 백업 |
| **고가용성** | 없음 | 자동 장애 조치 |
| **크레딧 사용** | 거의 없음 | 월 $10-15 사용 |
| **크레딧 만료 후** | 계속 무료 | $10-15/월 과금 |

**결론:**
- 💰 **비용 절약**: VM 내부 MySQL 사용 (이 가이드 방식)
- 🔧 **편의성**: Cloud SQL 사용 (자동 관리, 백업)

### 📊 예상 크레딧 사용 기간

**Always Free 티어만 사용 시:**
- **월 비용: $0**
- **$300 크레딧: 거의 사용 안 됨!**
- **크레딧 만료 후에도 계속 무료 사용 가능!** 🎉

**만약 실수로 유료 리전 사용 시:**
- `asia-northeast2` (서울): 약 $10-15/월
- **$300 크레딧으로 약 20-30개월 사용 가능**

**Cloud SQL 사용 시:**
- 월 비용: 약 $10-15/월
- **$300 크레딧으로 약 20-30개월 사용 가능**
- 크레딧 만료 후에도 계속 사용하려면 월 $10-15 과금 필요

### ⚠️ 주의사항

1. **리전 선택 실수 주의**
   - 한국 리전(`asia-northeast2`)은 유료!
   - 항상 `us-west1-a` 사용!

2. **머신 유형 주의**
   - `e2-micro` 이상은 유료!
   - `e2-small`, `n1-standard` 등 사용 금지!

3. **디스크 크기 주의**
   - 30GB 초과 시 유료!
   - 기본 30GB 사용!

4. **인스턴스 개수 주의**
   - 월 1개만 무료!
   - 여러 개 생성 시 유료!

---

## 🆘 문제 해결 (로컬에서 실행)

**⚠️ 모든 명령어는 로컬 컴퓨터에서 실행하세요!**

### MySQL 연결 오류
```bash
# MySQL 서비스 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl status mysql"

# MySQL 재시작
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl restart mysql"

# MySQL 접속 테스트
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo mysql -u root -pchopplan123 -e 'SHOW DATABASES;'"
```

### 애플리케이션 실행 오류
```bash
# Java 설치 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="java -version"

# 로그 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="tail -f ~/chopplan/app.log"

# 포트 사용 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo netstat -tuln | grep 8080"

# 프로세스 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="ps aux | grep java"
```

### 비용 확인
```bash
# 현재 사용 중인 리소스 확인
gcloud compute instances list
gcloud compute disks list
```

### 외부 접속 안 될 때
```bash
# 방화벽 규칙 확인
gcloud compute firewall-rules list

# 외부 IP 확인
gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

---

---

## 🌐 Step 8: 실제 사이트 운영 설정 (선택사항)

### 8-1. 정적 IP 주소 할당 (외부 IP 고정)

기본적으로 VM 인스턴스는 재시작 시 IP가 변경될 수 있습니다. 고정 IP를 사용하려면:

```bash
# 정적 IP 주소 예약
gcloud compute addresses create chopplan-static-ip \
    --region=us-west1

# 정적 IP 주소 확인
gcloud compute addresses describe chopplan-static-ip --region=us-west1

# VM에 정적 IP 할당 (VM 재생성 필요)
# 또는 VM 수정: 네트워크 인터페이스에서 IP 변경
```

**⚠️ 주의: 정적 IP는 Always Free 티어에 포함되지 않을 수 있습니다. 사용하지 않으면 비용 없음.**

### 8-2. 도메인 연결 (선택사항)

도메인이 있다면 VM의 외부 IP에 연결:

1. **도메인 제공자에서 A 레코드 설정**
   ```
   Type: A
   Name: @ 또는 www
   Value: [VM의 외부 IP]
   TTL: 3600
   ```

2. **외부 IP 확인**
   ```bash
   gcloud compute instances describe chopplan-server \
       --zone=us-west1-a \
       --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
   ```

### 8-3. HTTPS 설정 (선택사항 - 무료, 로컬에서 실행)

**로컬 컴퓨터에서 실행:**

```bash
# Certbot 설치
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt install certbot -y"

# SSL 인증서 발급 (도메인이 있어야 함)
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com"
```

**⚠️ 주의: HTTPS 설정은 도메인이 필요하며, 추가 설정이 필요합니다.**

### 8-4. 자동 재시작 설정 (로컬에서 실행)

VM 재시작 시 애플리케이션이 자동으로 시작되도록 설정:

**로컬 컴퓨터에서 실행:**

```bash
# systemd 서비스 파일 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo bash -c 'cat > /etc/systemd/system/chopplan.service << EOF
[Unit]
Description=ChopPlan Application
After=network.target mysql.service

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/chopplan
ExecStart=/usr/bin/java -jar /home/YOUR_USERNAME/chopplan/choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF'"
```

**또는 서비스 파일 내용을 직접 작성:**
```ini
[Unit]
Description=ChopPlan Application
After=network.target mysql.service

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/chopplan
ExecStart=/usr/bin/java -jar /home/YOUR_USERNAME/chopplan/choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**로컬 컴퓨터에서 실행:**

```bash
# 서비스 활성화
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl daemon-reload && sudo systemctl enable chopplan.service && sudo systemctl start chopplan.service"

# 서비스 상태 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl status chopplan.service"
```

### 8-5. 로그 관리 및 모니터링 (로컬에서 실행)

**로컬 컴퓨터에서 실행:**

```bash
# 로그 확인
gcloud compute ssh chopplan-server --zone=us-west1-a --command="tail -f ~/chopplan/app.log"

# 또는 systemd 서비스 사용 시
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo journalctl -u chopplan.service -f"

# 로그 로테이션 설정 (선택사항)
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo bash -c 'cat > /etc/logrotate.d/chopplan << EOF
/home/YOUR_USERNAME/chopplan/app.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 YOUR_USERNAME YOUR_USERNAME
}
EOF'"
```

### 8-6. 데이터베이스 백업 (매우 중요!)

**⚠️ VM 내부 MySQL 사용 시 백업은 필수입니다!**

VM이 삭제되거나 디스크가 손상되면 데이터가 모두 사라집니다. 정기적인 백업이 필수입니다.

#### 8-6-1. 백업 스크립트 생성 (로컬에서 실행)

**로컬 컴퓨터에서 실행:**

```bash
# 백업 스크립트 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo bash -c 'cat > ~/backup-database.sh << \"EOF\"
#!/bin/bash
BACKUP_DIR=~/backups
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# 데이터베이스 백업
mysqldump -u root -pchopplan123 chopplan > \$BACKUP_DIR/chopplan_\$DATE.sql

# 백업 파일 압축 (선택사항)
gzip \$BACKUP_DIR/chopplan_\$DATE.sql

# 7일 이상 된 백업 삭제
find \$BACKUP_DIR -name \"chopplan_*.sql.gz\" -mtime +7 -delete

echo \"백업 완료: chopplan_\$DATE.sql.gz\"
EOF'"

# 실행 권한 부여
gcloud compute ssh chopplan-server --zone=us-west1-a --command="chmod +x ~/backup-database.sh"

# 백업 자동화 (매일 새벽 2시 백업)
gcloud compute ssh chopplan-server --zone=us-west1-a --command="(crontab -l 2>/dev/null; echo '0 2 * * * /home/YOUR_USERNAME/backup-database.sh') | crontab -"
```

#### 8-6-2. 로컬로 백업 다운로드 (추천!)

**로컬 컴퓨터에서 실행:**

```bash
# VM에서 백업 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysqldump -u root -pchopplan123 chopplan > ~/chopplan_backup.sql"

# 로컬로 다운로드
gcloud compute scp chopplan-server:~/chopplan_backup.sql ./chopplan_backup_$(date +%Y%m%d).sql --zone=us-west1-a
```

**✅ 로컬 컴퓨터에 백업 파일이 저장됩니다!**

#### 8-6-3. Google Cloud Storage에 백업 업로드 (더 안전)

```bash
# Cloud Storage 버킷 생성 (선택사항, 비용 발생 가능)
# gsutil mb gs://chopplan-backups

# 백업을 Cloud Storage에 업로드
gcloud compute ssh chopplan-server --zone=us-west1-a --command="mysqldump -u root -pchopplan123 chopplan > ~/chopplan_backup.sql"
gcloud compute scp chopplan-server:~/chopplan_backup.sql ./chopplan_backup.sql --zone=us-west1-a
# gsutil cp chopplan_backup.sql gs://chopplan-backups/
```

**⚠️ 주의: Cloud Storage는 유료 서비스입니다. 로컬 백업을 추천합니다.**

---

## 📊 실제 운영 체크리스트

### ✅ 필수 항목 (사이트 운영을 위해 반드시 필요)
- [x] VM 인스턴스 생성 및 설정 (Step 1)
- [x] MySQL 설치 및 데이터베이스 생성 (Step 2)
- [x] 애플리케이션 배포 (Step 4)
- [x] 방화벽 규칙 설정 (Step 5)
- [ ] **자동 재시작 설정** (Step 8-4) - VM 재시작 시 자동 실행
- [ ] **데이터베이스 백업 설정** (Step 8-6) - **매우 중요!** 데이터 손실 방지

### 🔧 선택 항목 (서비스 품질 향상)
- [ ] 정적 IP 주소 할당 (Step 8-1) - IP 변경 방지
- [ ] 도메인 연결 (Step 8-2) - 사용자 친화적 URL
- [ ] HTTPS/SSL 인증서 설정 (Step 8-3) - 보안 강화
- [ ] 로그 모니터링 설정 (Step 8-5) - 문제 추적

### ⚡ 실시간 예약 시스템 확인 사항
- [x] `application-gcp.properties`에 실시간 반영 설정 추가 (Step 3-1-1)
- [x] 트랜잭션 즉시 커밋 설정 확인
- [x] 동시성 처리 (트랜잭션 격리 수준) 설정 확인
- [ ] 예약 생성/수정/조회 테스트

---

## 🎉 완료! 이제 사이트 운영 준비 완료!

### ✅ 배포 완료 상태

이제 모든 기능이 Google Cloud에서 실행됩니다! 🚀

**접속 방법:**
- 프론트엔드: `http://[EXTERNAL_IP]:8080`
- 백엔드 API: `http://[EXTERNAL_IP]:8080/api`
- 예약 API: `http://[EXTERNAL_IP]:8080/api/demo/reservations`

### ✅ 실시간 예약 시스템 확인

**예약 시스템이 정상 작동하는지 확인:**
1. 예약 생성 → 즉시 DB에 저장
2. 예약 조회 → 최신 데이터 즉시 반영
3. 예약 수정 → 즉시 반영
4. 동시 예약 → 여러 사용자 동시 접근 가능

**✅ VM 내부 MySQL은 실시간 예약 시스템에 완벽하게 적합합니다!**

### 🔧 실제 운영을 위한 필수 설정

**사이트 운영을 위해서는 반드시 다음 설정을 완료하세요:**

1. **자동 재시작 설정** (Step 8-4)
   - VM 재시작 시 애플리케이션이 자동으로 시작
   - 서비스 중단 방지

2. **데이터베이스 백업 설정** (Step 8-6) ⚠️ **매우 중요!**
   - VM 삭제 시 데이터 손실 방지
   - 매일 자동 백업 권장
   - 로컬로 백업 다운로드 권장

3. **(선택) 도메인 연결 및 HTTPS 설정** (Step 8-2, 8-3)
   - 사용자 친화적 URL
   - 보안 강화

### 💰 비용 요약

**현재 설정으로:**
- ✅ 월 비용: **$0 (완전 무료!)**
- ✅ $300 크레딧: **거의 사용 안 됨**
- ✅ 크레딧 만료 후: **계속 무료 사용 가능!**

**만약 Cloud SQL 사용 시:**
- ❌ 월 비용: $10-15/월
- ❌ 크레딧 사용: 월 $10-15
- ❌ 크레딧 만료 후: $10-15/월 과금

### 📞 문제 발생 시

**문제 해결 섹션 참고:**
- MySQL 연결 오류 (Step 7)
- 애플리케이션 실행 오류 (Step 7)
- 비용 확인 (Step 7)
- 외부 접속 안 될 때 (Step 7)

---

## 🎯 다음 단계

1. ✅ **자동 재시작 설정** (Step 8-4) - 필수!
2. ✅ **데이터베이스 백업 설정** (Step 8-6) - 필수!
3. ✅ **예약 시스템 테스트** - 정상 작동 확인
4. ✅ (선택) **도메인 연결 및 HTTPS 설정**

**이제 실시간 예약 시스템이 완벽하게 작동합니다!** 🚀


