# DBeaver로 MySQL 연결하기

## 🐬 MySQL + DBeaver 완벽 조합!

### 1. MySQL 설치 (Windows)

#### 방법 1: Chocolatey (추천)
```bash
# 관리자 권한으로 PowerShell 실행
choco install mysql

# 또는 MySQL 8.0만 설치
choco install mysql --version=8.0.33
```

#### 방법 2: 공식 사이트
- [MySQL 다운로드](https://dev.mysql.com/downloads/mysql/)
- **MySQL Community Server** 선택
- Windows용 MSI Installer 다운로드

#### 방법 3: XAMPP (가장 쉬움!)
- [XAMPP 다운로드](https://www.apachefriends.org/download.html)
- Apache + MySQL + PHP 한 번에 설치
- XAMPP Control Panel에서 MySQL 시작

### 2. MySQL 서비스 시작

#### XAMPP 사용 시
1. XAMPP Control Panel 실행
2. MySQL 옆 **Start** 버튼 클릭

#### 직접 설치 시
```bash
# Windows 서비스에서 MySQL 시작
net start mysql80

# 또는 서비스 관리자에서 "MySQL80" 시작
```

### 3. 데이터베이스 생성

#### MySQL Command Line 사용
```sql
-- MySQL에 접속 (root 계정)
mysql -u root -p

-- 데이터베이스 생성
CREATE DATABASE choprest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성
CREATE USER 'choprest'@'localhost' IDENTIFIED BY 'password123';

-- 권한 부여
GRANT ALL PRIVILEGES ON choprest.* TO 'choprest'@'localhost';
FLUSH PRIVILEGES;

-- 확인
SHOW DATABASES;
```

#### phpMyAdmin 사용 (XAMPP)
1. 브라우저에서 `http://localhost/phpmyadmin` 접속
2. **데이터베이스** 탭 클릭
3. 데이터베이스 이름: `choprest`
4. 정렬 방식: `utf8mb4_unicode_ci`
5. **만들기** 클릭

### 4. DBeaver 연결 설정

#### 4.1 새 연결 생성
1. **DBeaver 실행**
2. **새 연결**: `Database` → `New Database Connection`
3. **MySQL** 선택
4. **Next** 클릭

#### 4.2 연결 정보 입력
```
Connection name: ChopRest MySQL
Server Host: localhost
Port: 3306
Database: choprest
Username: choprest
Password: password123
```

#### 4.3 드라이버 설정
- **Driver**: MySQL (8.0+)
- **URL**: `jdbc:mysql://localhost:3306/choprest?useSSL=false&serverTimezone=UTC`
- **User**: `choprest`
- **Password**: `password123`

#### 4.4 연결 테스트
- **Test Connection** 클릭
- 성공하면 **Finish** 클릭

### 5. Spring Boot 애플리케이션 실행

```bash
# 프로젝트 루트에서
./gradlew bootRun
```

### 6. DBeaver에서 데이터 확인

#### 6.1 테이블 확인
```sql
-- 테이블 목록 확인
SHOW TABLES;

-- restaurant 테이블 구조 확인
DESCRIBE restaurant;
```

#### 6.2 데이터 조회
```sql
-- 식당 데이터 조회
SELECT id, restaurant_name, branch_name, region_name, lat, lng 
FROM restaurant 
LIMIT 10;

-- 지역별 식당 수
SELECT region_name, COUNT(*) as count 
FROM restaurant 
GROUP BY region_name 
ORDER BY count DESC;
```

### 7. DBeaver 유용한 기능

#### 7.1 ERD 생성
- `Database` → `Generate ER Diagram`
- 테이블 관계 시각화

#### 7.2 SQL 스크립트 실행
- `SQL Editor`에서 쿼리 작성
- `Ctrl+Enter`로 실행

#### 7.3 데이터 시각화
- `Data` 탭에서 테이블 데이터 확인
- 필터링, 정렬, 검색 가능

### 8. 문제 해결

#### 8.1 연결 실패
```bash
# MySQL 서비스 상태 확인
sc query mysql80

# 포트 확인
netstat -an | findstr 3306
```

#### 8.2 인증 오류
```sql
-- 사용자 권한 재설정
GRANT ALL PRIVILEGES ON choprest.* TO 'choprest'@'localhost';
FLUSH PRIVILEGES;
```

#### 8.3 문자 인코딩 문제
```sql
-- 데이터베이스 문자셋 확인
SHOW CREATE DATABASE choprest;

-- 테이블 문자셋 확인
SHOW CREATE TABLE restaurant;
```

## 🎯 MySQL의 장점

- ✅ **가장 인기 있는 오픈소스 DB**
- ✅ **완전 무료**
- ✅ **Spring Boot 기본 지원**
- ✅ **DBeaver 완벽 지원**
- ✅ **호스팅 서비스 많음** (AWS RDS, Google Cloud SQL)
- ✅ **커뮤니티 활발**
- ✅ **문서화 잘 되어 있음**
- ✅ **XAMPP로 쉽게 설치**

## 🚀 빠른 시작

1. **XAMPP 설치** (가장 쉬움)
2. **MySQL 시작**
3. **phpMyAdmin에서 데이터베이스 생성**
4. **DBeaver 연결**
5. **애플리케이션 실행**

완벽한 MySQL + DBeaver 조합입니다! 🎉

