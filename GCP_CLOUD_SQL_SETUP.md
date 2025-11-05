# ☁️ Google Cloud SQL 설정 가이드

## 📊 현재 데이터베이스 상태

- **총 크기**: 0.27 MB (매우 작음!)
- **주요 테이블**: restaurants (999개), demo_users, demo_reservations 등

---

## 💰 Google Cloud SQL 요금 분석

### 무료 크레딧: $300 (90일간)

**현재 데이터베이스 크기: 0.27MB로 매우 작으므로 무료 크레딧으로 충분합니다!**

### Cloud SQL MySQL 요금 구조 (대략적):

1. **인스턴스 (가장 저렴한 옵션: db-f1-micro)**
   - CPU: 공유 vCPU 1개
   - RAM: 0.6GB
   - **비용**: 약 $7-10/월 (지역에 따라 다름)
   - **$300 크레딧으로 약 30-40개월 사용 가능!** ✅

2. **스토리지**
   - 최소: 10GB
   - 현재 데이터: 0.27MB
   - **비용**: 약 $0.17/GB/월
   - **10GB 기준 약 $1.7/월**

3. **네트워크**
   - 외부 트래픽: $0.12/GB
   - 내부 트래픽: 무료

### 총 예상 비용:

**월 예상 비용**: 약 $10-15/월
- **$300 크레딧으로 약 20-30개월 사용 가능!** ✅

---

## 🎯 결론: 충분히 가능합니다!

### 이유:
1. ✅ **데이터베이스가 매우 작음** (0.27MB)
2. ✅ **$300 무료 크레딧** 제공
3. ✅ **예상 사용 기간: 20-30개월** (무료 크레딧으로)
4. ✅ **인스턴스 크기 조정 가능** (더 작은 인스턴스 사용 가능)

### 무료 크레딧 종료 후:

**Always Free 티어는 없지만**, 다음과 같은 방법으로 비용 절감 가능:
1. **가장 작은 인스턴스 사용** (db-f1-micro)
2. **필요할 때만 실행** (개발 시에만)
3. **데이터 최적화** (좌표 없는 식당 삭제 등)
4. **다른 무료 옵션 고려** (Supabase, PlanetScale 등)

---

## 🚀 Google Cloud SQL 설정 방법

### 1단계: Google Cloud 프로젝트 생성

1. https://console.cloud.google.com 접속
2. 프로젝트 생성
3. 결제 계정 연결 (무료 크레딧 사용)

### 2단계: Cloud SQL 인스턴스 생성

**SQL 인스턴스 만들기:**
1. Cloud SQL > 인스턴스 만들기
2. MySQL 선택
3. 인스턴스 ID: `chopplan-db`
4. 비밀번호 설정
5. **리전**: `asia-northeast2` (서울) - 가장 가까움
6. **머신 유형**: db-f1-micro (가장 저렴)
7. **스토리지**: 10GB (최소)

### 3단계: 데이터베이스 생성

**Cloud SQL 인스턴스 내에서:**
1. 데이터베이스 탭
2. 데이터베이스 만들기
3. 이름: `chopplan`

### 4단계: 연결 설정

**Public IP 활성화** (로컬에서 접근하려면)
1. 연결 > 네트워크
2. 공용 IP 추가
3. 승인된 네트워크에 본인 IP 추가

---

## 📝 application.properties 설정

### `application-gcp.properties` 업데이트:

```properties
# Google Cloud SQL 설정
spring.datasource.url=jdbc:mysql://[CLOUD_SQL_IP]:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=[YOUR_PASSWORD]
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

---

## 🔄 데이터 마이그레이션

### 현재 로컬 데이터베이스를 GCP로 옮기는 방법:

**1. 데이터베이스 덤프 (로컬):**
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

**2. GCP로 업로드:**
```bash
# Cloud SQL에 직접 가져오기
gcloud sql import sql chopplan-db gs://[BUCKET_NAME]/chopplan_backup.sql --database=chopplan
```

또는 **Cloud SQL Proxy** 사용

---

## ⚠️ 주의사항

1. **무료 크레딧은 90일 후 종료**
2. **크레딧 종료 후 과금 시작** (약 $10-15/월)
3. **사용량 모니터링 필수**
4. **필요 시 더 작은 인스턴스로 다운그레이드 가능**

---

## 💡 비용 절감 팁

1. **가장 작은 인스턴스 사용** (db-f1-micro)
2. **필요할 때만 실행** (개발 환경)
3. **데이터 정리** (좌표 없는 식당 삭제 등)
4. **스토리지 최적화** (10GB 이상 사용 시)

---

## ✅ 결론

**충분히 가능합니다!**

- 현재 데이터: 0.27MB (매우 작음)
- 예상 비용: $10-15/월
- $300 크레딧: 20-30개월 사용 가능
- 크레딧 종료 후에도 저렴한 비용으로 운영 가능

**지금 바로 설정 가능합니다!** 🚀



