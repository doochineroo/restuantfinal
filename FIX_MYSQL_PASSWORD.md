# 🔐 MySQL 비밀번호 문제 해결

백엔드 실행 시 `Access denied for user 'root'@'localhost' (using password: NO)` 오류가 발생합니다.

## 🔍 문제 확인

현재 `application.properties`에 비밀번호가 비어있습니다:
```properties
spring.datasource.password=
```

하지만 MySQL에는 비밀번호가 설정되어 있어서 연결이 실패합니다.

## ✅ 해결 방법

### 방법 1: MySQL 비밀번호 찾기 및 설정

1. **MySQL 접속 시도**
   ```bash
   mysql -u root -p
   ```
   비밀번호를 입력해보세요 (일반적인 비밀번호: chopplan123, chopplan12, password, root, 1234 등)

2. **비밀번호 확인 후 application.properties 수정**
   ```properties
   spring.datasource.password=찾은비밀번호
   ```

### 방법 2: MySQL 비밀번호 재설정 (비밀번호를 모를 때)

#### XAMPP 사용 시:
1. XAMPP Control Panel에서 MySQL Stop
2. MySQL 설정 파일 수정:
   - `C:\xampp\mysql\bin\my.ini` 또는 `C:\xampp\mysql\bin\my.cnf`
   - `[mysqld]` 섹션에 추가:
     ```ini
     skip-grant-tables
     ```
3. MySQL Start
4. MySQL 접속:
   ```bash
   mysql -u root
   ```
5. 비밀번호 재설정:
   ```sql
   USE mysql;
   UPDATE user SET authentication_string='' WHERE User='root';
   FLUSH PRIVILEGES;
   EXIT;
   ```
6. 설정 파일에서 `skip-grant-tables` 제거
7. MySQL 재시작

#### MySQL 직접 설치 시:
```bash
# MySQL 서비스 중지
net stop mysql80

# 안전 모드로 시작
mysqld --skip-grant-tables

# 새 창에서 접속
mysql -u root

# 비밀번호 제거 또는 재설정
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;
```

### 방법 3: MySQL root 비밀번호 제거 (개발 환경)

```bash
# 현재 비밀번호로 접속
mysql -u root -p

# 비밀번호 제거
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;
```

그 후 `application.properties`는 그대로 두면 됩니다:
```properties
spring.datasource.password=
```

### 방법 4: 새 비밀번호 설정

```bash
mysql -u root -p

# 새 비밀번호 설정 (예: chopplan123)
ALTER USER 'root'@'localhost' IDENTIFIED BY 'chopplan123';
FLUSH PRIVILEGES;
EXIT;
```

그 후 `application.properties` 수정:
```properties
spring.datasource.password=chopplan123
```

## 🎯 빠른 해결 (권장)

1. **MySQL에 접속해서 비밀번호 확인**
   ```bash
   mysql -u root -p
   # 여러 비밀번호 시도: chopplan123, chopplan12, password 등
   ```

2. **비밀번호를 찾으면 application.properties 수정**
   ```properties
   spring.datasource.password=찾은비밀번호
   ```

3. **비밀번호를 모르면 재설정**
   ```bash
   # XAMPP 사용 시: 설정 파일에 skip-grant-tables 추가 후 재시작
   # 또는 안전 모드로 시작 후 비밀번호 제거
   ```

4. **백엔드 재실행**
   ```bash
   gradlew.bat bootRun
   ```

## ⚡ 가장 빠른 방법

개발 환경이라면 비밀번호를 제거하는 것이 가장 간단합니다:

```bash
# MySQL 접속 (비밀번호 시도)
mysql -u root -p

# 비밀번호 제거
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;
```

그러면 `application.properties`는 그대로 두고 백엔드를 실행하면 됩니다!





