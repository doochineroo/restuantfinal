# ⚡ 빠른 설정: 로컬 + Cloud SQL (5분 완성)

로컬에서 개발하면서 데이터베이스만 Google Cloud SQL을 사용하는 빠른 설정 가이드입니다.

## 💰 비용 요약
- **무료 크레딧**: $300 (신규 사용자)
- **사용 기간**: 약 20-30개월 (무료 크레딧으로)
- **월 예상 비용**: $10-15/월 (크레딧 종료 후)

## 🚀 빠른 설정 (2가지 방법)

### 방법 1: CLI 자동 설정 (권장) ⚡

**한 번에 모든 설정 완료!**

```bash
setup-cloud-sql-cli.bat
```

이 스크립트가 자동으로:
1. ✅ Cloud SQL Admin API 활성화
2. ✅ Cloud SQL 인스턴스 생성
3. ✅ 데이터베이스 생성
4. ✅ Public IP 설정
5. ✅ 네트워크 설정 (현재 IP 추가)
6. ✅ 연결 정보 출력

### 방법 2: Cloud Console (UI) 사용

### 1단계: Cloud SQL 인스턴스 생성 (2분)

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com
   - 프로젝트 생성 (또는 기존 프로젝트 선택)
   - 결제 계정 연결 (무료 크레딧 사용)

2. **Cloud SQL 인스턴스 생성**
   - Cloud SQL > 인스턴스 만들기
   - MySQL 선택
   - 설정:
     ```
     인스턴스 ID: chopplan-db
     비밀번호: [설정] (기억하세요!)
     리전: asia-northeast2 (서울)
     머신 유형: db-f1-micro (가장 저렴)
     스토리지: 10GB
     ```
   - 만들기 클릭

### 2단계: 데이터베이스 생성 (30초)

1. 생성된 인스턴스 클릭
2. **데이터베이스** 탭 > **데이터베이스 만들기**
3. 이름: `chopplan`
4. 만들기

### 3단계: Public IP 설정 (1분)

1. **연결** 탭 클릭
2. **네트워크** 섹션:
   - **공용 IP** 활성화
   - **승인된 네트워크**에 본인 IP 추가:
     ```
     내 IP 확인: https://www.whatismyip.com/
     ```
     또는 `0.0.0.0/0` (모든 IP 허용 - 개발용만!)

3. **Public IP 주소 확인** (나중에 사용)
   - 예: `34.64.123.45`

### 4단계: 설정 파일 수정 (1분)

**파일**: `src/main/resources/application-cloudsql.properties`

```properties
# Cloud SQL Public IP로 변경
spring.datasource.url=jdbc:mysql://[YOUR_IP]:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8

# 비밀번호 설정
spring.datasource.password=[YOUR_PASSWORD]
```

**예시:**
```properties
spring.datasource.url=jdbc:mysql://34.64.123.45:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.password=chopplan123
```

### 5단계: 실행! (30초)

**백엔드 실행:**
```bash
quick-test-local-cloudsql.bat
```

**프론트엔드 실행 (새 터미널):**
```bash
cd frontend
npm start
```

**접속:**
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api

## ✅ 완료!

이제 로컬에서 개발하면서 데이터베이스는 Cloud SQL을 사용합니다!

## 🔄 데이터 마이그레이션 (로컬 → Cloud SQL)

로컬에 데이터가 있다면:

**DBeaver 사용 (권장):**
1. 로컬 MySQL 연결
2. `chopplan` 데이터베이스 백업
3. Cloud SQL 연결
4. 백업 파일 실행

**명령줄 사용:**
```bash
# 덤프
mysqldump -u root -p1234 chopplan > chopplan_backup.sql

# Cloud SQL로 가져오기
mysql -h [CLOUD_SQL_IP] -u root -p chopplan < chopplan_backup.sql
```

## ❓ 문제 해결

**"Connection refused"**
- Public IP 활성화 확인
- 승인된 네트워크에 본인 IP 추가 확인

**"Access denied"**
- 비밀번호 확인
- `application-cloudsql.properties` 확인

## 📚 상세 가이드

- **CLI 사용법**: [CLOUD_SQL_CLI_GUIDE.md](CLOUD_SQL_CLI_GUIDE.md)
- **상세 가이드**: [LOCAL_WITH_CLOUD_SQL_GUIDE.md](LOCAL_WITH_CLOUD_SQL_GUIDE.md)

