# ☁️ 로컬 + Google Cloud SQL 사용 가이드

로컬에서 백엔드와 프론트엔드를 실행하되, 데이터베이스만 Google Cloud SQL을 사용하는 방법입니다.

## 💰 비용 정보

- **무료 크레딧**: $300 (신규 사용자)
- **예상 사용 기간**: 약 20-30개월 (무료 크레딧으로)
- **월 예상 비용**: 약 $10-15/월 (크레딧 종료 후)
- **인스턴스**: db-f1-micro (가장 저렴)

## 🚀 1단계: Google Cloud SQL 인스턴스 생성

### 1-1. Google Cloud Console 접속
1. https://console.cloud.google.com 접속
2. 프로젝트 생성 (또는 기존 프로젝트 선택)
3. 결제 계정 연결 (무료 크레딧 사용)

### 1-2. Cloud SQL 인스턴스 생성
1. **Cloud SQL** 메뉴 클릭
2. **인스턴스 만들기** 클릭
3. **MySQL** 선택
4. 설정 입력:
   - **인스턴스 ID**: `chopplan-db`
   - **비밀번호**: 설정 (나중에 사용)
   - **리전**: `asia-northeast2` (서울) - 가장 가까움
   - **데이터베이스 버전**: MySQL 8.0
   - **머신 유형**: `db-f1-micro` (가장 저렴)
   - **스토리지**: 10GB (최소)
5. **만들기** 클릭

### 1-3. 데이터베이스 생성
1. 생성된 인스턴스 클릭
2. **데이터베이스** 탭 클릭
3. **데이터베이스 만들기** 클릭
4. 이름: `chopplan`
5. **만들기** 클릭

### 1-4. Public IP 활성화 및 네트워크 설정
1. **연결** 탭 클릭
2. **네트워크** 섹션에서:
   - **공용 IP** 활성화
   - **승인된 네트워크**에 본인 IP 추가:
     ```
     내 IP 주소 확인: https://www.whatismyip.com/
     ```
     또는 `0.0.0.0/0` (모든 IP 허용 - 개발용만, 프로덕션에서는 위험!)

## 📝 2단계: 연결 정보 확인

### 2-1. Public IP 확인
1. Cloud SQL 인스턴스 개요 페이지
2. **연결 이름** 또는 **IP 주소** 확인
   - 예: `34.64.123.45`

### 2-2. 비밀번호 확인
- 인스턴스 생성 시 설정한 root 비밀번호

## ⚙️ 3단계: application-cloudsql.properties 설정

### 3-1. 파일 위치
`src/main/resources/application-cloudsql.properties`

### 3-2. 설정 내용 수정
```properties
# Cloud SQL Public IP로 변경
spring.datasource.url=jdbc:mysql://[YOUR_CLOUD_SQL_IP]:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8

# 비밀번호 설정
spring.datasource.password=[YOUR_CLOUD_SQL_PASSWORD]
```

**예시:**
```properties
spring.datasource.url=jdbc:mysql://34.64.123.45:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.password=chopplan123
```

## 🧪 4단계: 연결 테스트

### 4-1. DBeaver로 테스트 (권장)
1. DBeaver 실행
2. 새 연결 > MySQL
3. 설정:
   ```
   호스트: [Cloud SQL Public IP]
   포트: 3306
   데이터베이스: chopplan
   사용자: root
   비밀번호: [설정한 비밀번호]
   ```
4. **테스트 연결** 클릭
5. ✅ 성공하면 연결 완료!

### 4-2. 명령줄로 테스트
```bash
mysql -h [CLOUD_SQL_IP] -u root -p chopplan
# 비밀번호 입력
SHOW TABLES;
```

## 🚀 5단계: 로컬에서 실행

### 5-1. 백엔드 실행 (Cloud SQL 사용)
```bash
# 빌드
gradlew.bat clean build

# Cloud SQL 프로파일로 실행
gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
```

또는:
```bash
java -jar build\libs\choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=cloudsql
```

### 5-2. 프론트엔드 실행 (새 터미널)
```bash
cd frontend
npm start
```

### 5-3. 접속 확인
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api

## 📋 스크립트 사용

### quick-test-local-cloudsql.bat 실행
```bash
quick-test-local-cloudsql.bat
```

이 스크립트는:
1. 백엔드를 빌드
2. Cloud SQL 프로파일로 실행
3. 프론트엔드 실행 안내

## 🔄 데이터 마이그레이션 (로컬 → Cloud SQL)

### 방법 1: DBeaver 사용 (권장)
1. 로컬 MySQL에 연결 (DBeaver)
2. `chopplan` 데이터베이스 백업
3. Cloud SQL에 연결 (DBeaver)
4. 백업 파일 실행

### 방법 2: mysqldump 사용
```bash
# 1. 로컬 데이터베이스 덤프
mysqldump -u root -p1234 chopplan > chopplan_backup.sql

# 2. Cloud SQL로 가져오기
mysql -h [CLOUD_SQL_IP] -u root -p chopplan < chopplan_backup.sql
```

## ⚠️ 주의사항

1. **보안**: 
   - Public IP 사용 시 방화벽 규칙 설정 필수
   - 프로덕션에서는 Cloud SQL Proxy 사용 권장

2. **비용**:
   - 무료 크레딧: 90일간 $300
   - 크레딧 종료 후: 약 $10-15/월
   - 사용량 모니터링 필수

3. **네트워크**:
   - 로컬에서 Cloud SQL로 연결 시 약간의 지연 발생 가능
   - 안정적인 인터넷 연결 필요

## ❓ 문제 해결

### "Connection refused"
- Cloud SQL Public IP가 활성화되었는지 확인
- 승인된 네트워크에 본인 IP가 추가되었는지 확인
- 방화벽 규칙 확인

### "Access denied"
- 비밀번호 확인
- `application-cloudsql.properties`의 비밀번호 확인

### "Unknown database"
- Cloud SQL에 `chopplan` 데이터베이스가 생성되었는지 확인
- 데이터 마이그레이션 필요

### 연결이 느림
- 리전이 `asia-northeast2` (서울)인지 확인
- 네트워크 연결 상태 확인

## 💡 비용 절감 팁

1. **가장 작은 인스턴스 사용**: db-f1-micro
2. **사용량 모니터링**: 정기적으로 확인
3. **불필요한 데이터 삭제**: 좌표 없는 식당 등
4. **크레딧 종료 후**: 더 작은 인스턴스 고려

## ✅ 체크리스트

- [ ] Google Cloud 프로젝트 생성
- [ ] 결제 계정 연결 (무료 크레딧)
- [ ] Cloud SQL 인스턴스 생성 (db-f1-micro)
- [ ] 데이터베이스 `chopplan` 생성
- [ ] Public IP 활성화
- [ ] 승인된 네트워크에 본인 IP 추가
- [ ] `application-cloudsql.properties` 설정
- [ ] DBeaver로 연결 테스트
- [ ] 백엔드 실행 성공
- [ ] 프론트엔드 실행 성공
- [ ] 브라우저에서 접속 확인

## 🎯 다음 단계

로컬 테스트 완료 후:
- GCP VM에 배포: `quick-deploy.bat`
- 또는 계속 로컬에서 개발하면서 Cloud SQL 사용

