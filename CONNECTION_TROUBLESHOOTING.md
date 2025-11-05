# 🔧 Cloud SQL 연결 문제 해결 가이드

## ❌ 연결 실패 원인

### 일반적인 원인

1. **Public IP가 활성화되지 않음**
2. **승인된 네트워크에 본인 IP가 없음**
3. **비밀번호가 틀림**
4. **데이터베이스가 생성되지 않음**
5. **인스턴스가 아직 준비되지 않음**

## 🚀 자동 진단 및 해결

### 방법 1: 자동 진단 스크립트 (권장)

```bash
fix-cloudsql-connection.bat
```

이 스크립트는:
1. ✅ 인스턴스 상태 확인
2. ✅ Public IP 확인 및 추가
3. ✅ 현재 IP 확인
4. ✅ 승인된 네트워크에 IP 추가
5. ✅ 데이터베이스 확인 및 생성
6. ✅ 연결 테스트

## 📋 단계별 해결 방법

### 1단계: Public IP 확인

**확인:**
```bash
gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)"
```

**없으면 추가:**
```bash
gcloud sql instances patch chopplan-db --assign-ip
```

### 2단계: 승인된 네트워크 확인

**현재 IP 확인:**
```bash
# Windows PowerShell
(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content

# 또는 브라우저에서
https://www.whatismyip.com/
```

**승인된 네트워크 확인:**
```bash
gcloud sql instances describe chopplan-db --format="value(settings.ipConfiguration.authorizedNetworks[].value)"
```

**IP 추가:**
```bash
gcloud sql instances patch chopplan-db --authorized-networks=[YOUR_IP]/32
```

**모든 IP 허용 (개발용만, 위험!):**
```bash
gcloud sql instances patch chopplan-db --authorized-networks=0.0.0.0/0
```

### 3단계: 데이터베이스 확인

**데이터베이스 목록:**
```bash
gcloud sql databases list --instance=chopplan-db
```

**없으면 생성:**
```bash
gcloud sql databases create chopplan --instance=chopplan-db --charset=utf8mb4 --collation=utf8mb4_unicode_ci
```

### 4단계: 연결 테스트

```bash
mysql -h [PUBLIC_IP] -u root -p chopplan
```

## 🔍 문제별 해결

### "Connection refused"

**원인:** Public IP가 없거나 네트워크 설정 문제

**해결:**
```bash
# Public IP 추가
gcloud sql instances patch chopplan-db --assign-ip

# IP 추가
gcloud sql instances patch chopplan-db --authorized-networks=[YOUR_IP]/32
```

### "Access denied"

**원인:** 비밀번호가 틀림

**해결:**
- 비밀번호 확인
- `application-cloudsql.properties` 확인

### "Unknown database"

**원인:** 데이터베이스가 생성되지 않음

**해결:**
```bash
gcloud sql databases create chopplan --instance=chopplan-db
```

### "Operation failed"

**원인:** 인스턴스가 아직 준비되지 않음

**해결:**
```bash
# 상태 확인
gcloud sql instances describe chopplan-db --format="value(state)"

# RUNNABLE 상태가 될 때까지 대기
wait-for-cloudsql-ready.bat
```

## ✅ 연결 확인 체크리스트

- [ ] 인스턴스 상태: RUNNABLE
- [ ] Public IP 활성화
- [ ] 현재 IP가 승인된 네트워크에 추가됨
- [ ] 데이터베이스 생성됨
- [ ] 비밀번호 확인
- [ ] MySQL 연결 테스트 성공

## 🎯 빠른 해결

```bash
# 자동 진단 및 해결
fix-cloudsql-connection.bat

# 또는 수동 확인
test-cloudsql-connection.bat
```

## 💡 팁

### IP 변경 시

IP가 변경되면 승인된 네트워크에 다시 추가해야 합니다:
```bash
gcloud sql instances patch chopplan-db --authorized-networks=[NEW_IP]/32
```

### 모든 IP 허용 (개발용)

개발 중에는 모든 IP를 허용할 수 있습니다 (프로덕션에서는 위험!):
```bash
gcloud sql instances patch chopplan-db --authorized-networks=0.0.0.0/0
```

### 연결 정보 저장

성공적으로 연결되면 다음 정보를 저장하세요:
- Public IP
- 비밀번호
- `application-cloudsql.properties` 설정

## 📝 application-cloudsql.properties 설정

연결 성공 후 설정:

```properties
spring.datasource.url=jdbc:mysql://[PUBLIC_IP]:3306/chopplan?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=[비밀번호]
```

## 🚀 완전한 해결 방법

```bash
# 1. 자동 진단 및 해결
fix-cloudsql-connection.bat

# 2. 연결 테스트
test-cloudsql-connection.bat

# 3. 백엔드 연결 테스트
test-local-to-cloudsql.bat
```

