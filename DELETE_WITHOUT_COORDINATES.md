# 🗑️ 좌표 없는 레스토랑 삭제 - 비밀번호 문제 해결

## ✅ 가장 쉬운 방법: API 사용

비밀번호 문제 없이 API로 삭제할 수 있습니다.

### 1단계: 백엔드 실행

```bash
gradlew.bat bootRun
```

### 2단계: 삭제 실행

```bash
# 통계 확인
curl http://localhost:8080/api/restaurants/statistics/coordinates

# 삭제 실행
curl -X DELETE http://localhost:8080/api/restaurants/cleanup/without-coordinates
```

또는 브라우저에서:
- 통계: http://localhost:8080/api/restaurants/statistics/coordinates
- 삭제: http://localhost:8080/api/restaurants/cleanup/without-coordinates (DELETE 요청)

## 🔧 MySQL 비밀번호 확인

```bash
check-mysql-password.bat
```

이 스크립트가:
- 비밀번호 없이 연결되는지 확인
- 일반적인 비밀번호로 자동 시도
- 올바른 비밀번호를 찾아서 알려줌

## 💡 해결 방법

### 방법 1: MySQL root 비밀번호 제거 (개발 환경)

```bash
setup-mysql-no-password.bat
```

또는 직접:
```sql
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
exit
```

그 후 `cleanup-restaurants-no-password.bat` 사용

### 방법 2: 올바른 비밀번호 찾기

1. `check-mysql-password.bat` 실행
2. 찾은 비밀번호를 `application.properties`에 설정:
   ```properties
   spring.datasource.password=찾은비밀번호
   ```

### 방법 3: MySQL Workbench/DBeaver 사용

1. MySQL Workbench 또는 DBeaver 실행
2. `cleanup-restaurants-without-coordinates.sql` 파일 열기
3. SQL 실행 (F5)

### 방법 4: 명령줄에서 직접

```bash
# 1. MySQL 접속
mysql -u root -p

# 2. SQL 실행
USE restaurant-demo;
DELETE FROM restaurants WHERE lat IS NULL OR lng IS NULL;

# 3. 확인
SELECT COUNT(*) FROM restaurants;

# 4. 최적화
OPTIMIZE TABLE restaurants;
exit
```

## 🎯 추천 순서

1. **API 사용** (가장 쉬움) ← 추천!
2. MySQL Workbench/DBeaver 사용
3. MySQL 비밀번호 제거 후 스크립트 사용
4. 명령줄 직접 실행

## ❓ 여전히 문제가 있나요?

MySQL에 접속이 안 되는 경우:
1. MySQL 서비스가 실행 중인지 확인
2. XAMPP 사용 시: Control Panel에서 MySQL Start
3. MySQL 직접 설치 시: 서비스 관리자에서 MySQL 서비스 시작





