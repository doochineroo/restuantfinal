# 🔧 MySQL 비밀번호 문제 최종 해결

## 현재 상황
- `Access denied for user 'root'@'localhost' (using password: YES)`
- 비밀번호 `chopplan123`으로 설정했지만 여전히 연결 안 됨

## ✅ 가장 확실한 해결 방법

### 방법 1: MySQL에 직접 접속해서 비밀번호 확인/재설정

```bash
# MySQL 접속 시도
mysql -u root -p
```

여러 비밀번호 시도:
- chopplan123
- chopplan12  
- password
- root
- 1234
- (비밀번호 없음 - 그냥 Enter)

**접속 성공 후:**

#### 옵션 A: 비밀번호 제거 (개발 환경, 가장 간단)
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;
```

그 후 `application.properties`:
```properties
spring.datasource.password=
```

#### 옵션 B: 비밀번호를 chopplan123으로 설정
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'chopplan123';
FLUSH PRIVILEGES;
EXIT;
```

그 후 `application.properties`:
```properties
spring.datasource.password=chopplan123
```

### 방법 2: XAMPP 사용 시 특별 설정

XAMPP의 MySQL은 기본적으로 비밀번호가 없을 수 있습니다.

1. XAMPP Control Panel에서 MySQL Start
2. MySQL 접속:
   ```bash
   mysql -u root
   # 비밀번호 없이 접속
   ```

3. 비밀번호 설정 (선택사항):
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'chopplan123';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### 방법 3: 안전 모드로 비밀번호 재설정

MySQL에 접속이 안 되는 경우:

#### XAMPP 사용 시:
1. `C:\xampp\mysql\bin\my.ini` 파일 열기
2. `[mysqld]` 섹션에 추가:
   ```ini
   skip-grant-tables
   ```
3. MySQL 재시작 (XAMPP Control Panel)
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
6. `my.ini`에서 `skip-grant-tables` 제거
7. MySQL 재시작

#### MySQL 직접 설치 시:
1. MySQL 서비스 중지:
   ```bash
   net stop mysql80
   ```

2. 안전 모드로 시작:
   ```bash
   mysqld --skip-grant-tables
   ```

3. 새 창에서:
   ```bash
   mysql -u root
   ```

4. 비밀번호 재설정:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. MySQL 재시작

## 🎯 빠른 해결 순서

1. **MySQL 접속 시도:**
   ```bash
   mysql -u root -p
   # 여러 비밀번호 시도
   ```

2. **접속 성공하면 비밀번호 제거 (가장 간단):**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **application.properties 확인:**
   ```properties
   spring.datasource.password=
   ```

4. **백엔드 재실행:**
   ```bash
   gradlew.bat bootRun
   ```

## ❓ 여전히 안 되면

`reset-mysql-password.bat` 실행:
```bash
./reset-mysql-password.bat
```

스크립트가 단계별로 안내합니다.





