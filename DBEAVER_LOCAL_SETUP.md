# 🔧 DBeaver 로컬 MySQL 연결 설정

AWS RDS 대신 로컬 MySQL을 사용하도록 DBeaver 연결을 수정하세요.

## 🔍 문제 확인

현재 오류는 DBeaver가 여전히 AWS RDS에 연결을 시도하고 있거나, 로컬 MySQL 서버가 실행되지 않았을 수 있습니다.

## ✅ 해결 방법

### 1단계: 로컬 MySQL 서버 확인

**XAMPP 사용 시:**
- XAMPP Control Panel에서 MySQL이 "Running"인지 확인
- 포트 3306에서 실행 중이어야 함

**MySQL 직접 설치 시:**
```bash
# 서비스 확인
net start mysql80

# 또는 서비스 관리자에서 확인
services.msc
# MySQL80 서비스가 실행 중인지 확인
```

### 2단계: DBeaver 연결 설정 수정

1. **DBeaver 열기**
2. **데이터베이스 연결** → 기존 연결 선택 (또는 새로 만들기)
3. **연결 설정 수정:**

   **일반 탭:**
   ```
   Host: localhost (또는 127.0.0.1)
   Port: 3306
   Database: restaurant-demo
   Username: root
   Password: chopplan123 (또는 실제 비밀번호)
   ```

   **⚠️ 주의:** Host가 AWS RDS 주소가 아닌지 확인!
   - ❌ 잘못된 예: `chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com`
   - ✅ 올바른 예: `localhost` 또는 `127.0.0.1`

4. **테스트 연결** 클릭
5. **저장**

### 3단계: 데이터베이스 생성 (없는 경우)

로컬에 `restaurant-demo` 데이터베이스가 없으면 생성:

```bash
mysql -u root -pchopplan123
CREATE DATABASE IF NOT EXISTS `restaurant-demo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

또는 DBeaver에서:
1. MySQL 연결 후
2. SQL 편집기 열기
3. 다음 SQL 실행:
```sql
CREATE DATABASE IF NOT EXISTS `restaurant-demo` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4단계: 기존 AWS RDS 연결 삭제 (선택사항)

DBeaver에서 더 이상 사용하지 않는 AWS RDS 연결을 삭제:
1. 데이터베이스 네비게이터에서 연결 우클릭
2. "연결 삭제" 선택

## 🔧 연결 정보 요약

**로컬 MySQL (현재 사용):**
```
Host: localhost
Port: 3306
Database: restaurant-demo
Username: root
Password: chopplan123 (또는 실제 비밀번호)
```

**AWS RDS (사용 안 함 - 삭제됨):**
```
❌ 더 이상 사용하지 않음
Host: chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com
```

## ❓ 문제 해결

### "Communications link failure" 오류

1. **MySQL 서버 실행 확인**
   - XAMPP: Control Panel에서 MySQL Start
   - 직접 설치: `net start mysql80`

2. **포트 확인**
   ```bash
   netstat -ano | findstr :3306
   ```
   결과가 나오면 MySQL이 실행 중입니다.

3. **방화벽 확인**
   - 로컬 연결은 보통 방화벽 문제 없음

### 연결은 되는데 데이터베이스가 없음

데이터베이스 생성:
```sql
CREATE DATABASE IF NOT EXISTS `restaurant-demo` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 비밀번호 오류

올바른 비밀번호 확인:
```bash
mysql -u root -p
# 비밀번호 입력 시도
```

## ✅ 확인 체크리스트

- [ ] MySQL 서버 실행 중 (XAMPP 또는 서비스)
- [ ] DBeaver 연결 설정이 localhost:3306
- [ ] 데이터베이스 `restaurant-demo` 존재
- [ ] 올바른 비밀번호 설정
- [ ] 테스트 연결 성공





