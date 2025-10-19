# 🚀 ChopRest 데모 시스템 실행 가이드

완전 초보자를 위한 단계별 실행 가이드입니다.

---

## 📋 사전 준비 (한 번만 하면 됩니다)

### 필수 프로그램 설치 확인
```cmd
# Java 버전 확인 (17 이상 필요)
java -version

# Node.js 버전 확인 (14 이상 필요)
node -v
npm -v

# MySQL 실행 확인
mysql --version
```

---

## 🎯 전체 실행 순서

### **1단계: MySQL 데이터베이스 준비** 🗄️

#### Windows PowerShell 또는 CMD 열기

```cmd
# MySQL 접속
mysql -u root -p
```

#### MySQL에서 실행
```sql
-- 데이터베이스가 없으면 생성
CREATE DATABASE IF NOT EXISTS choprest;

-- 데이터베이스 사용
USE choprest;

-- 기존 테이블이 있다면 확인
SHOW TABLES;

-- 종료
exit;
```

#### 테스트 데이터 생성 (선택사항)
```cmd
# 프로젝트 루트 폴더에서 실행
cd C:\yonsai\chopplan\choprest

# 데모 테스트 데이터 삽입
mysql -u root -p choprest < demo-test-data-v2.sql
```

---

### **2단계: 백엔드(Spring Boot) 실행** ☕

#### CMD 또는 PowerShell 열기 (첫 번째 터미널)

```cmd
# 프로젝트 루트 폴더로 이동
cd C:\yonsai\chopplan\choprest

# 빌드 (처음 한 번 또는 코드 변경 시)
gradlew.bat clean build

# 서버 실행
gradlew.bat bootRun
```

#### 성공 메시지 확인
```
Started ChoprestApplication in X.XXX seconds
```

#### 서버 주소
- http://localhost:8080

**💡 이 터미널은 닫지 마세요! 백엔드가 실행 중입니다.**

---

### **3단계: 프론트엔드(React) 실행** ⚛️

#### 새 CMD 또는 PowerShell 열기 (두 번째 터미널)

```cmd
# 프론트엔드 폴더로 이동
cd C:\yonsai\chopplan\choprest\frontend

# 패키지 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm start
```

#### 자동으로 브라우저가 열립니다
- http://localhost:3000

**💡 이 터미널도 닫지 마세요! 프론트엔드가 실행 중입니다.**

---

### **4단계: 브라우저에서 테스트** 🌐

#### 메인 페이지
http://localhost:3000/

#### 데모 로그인 페이지
http://localhost:3000/demo/login

#### 테스트 계정
```
관리자
- 아이디: admin
- 비밀번호: admin123

가게 주인
- 아이디: owner
- 비밀번호: owner123

일반 회원
- 아이디: user
- 비밀번호: user123
```

---

## ⚡ 빠른 실행 (3줄 요약)

```cmd
# 1. 백엔드 실행 (첫 번째 터미널)
cd C:\yonsai\chopplan\choprest && gradlew.bat bootRun

# 2. 프론트엔드 실행 (두 번째 터미널)
cd C:\yonsai\chopplan\choprest\frontend && npm start

# 3. 브라우저에서 http://localhost:3000/demo/login 접속
```

---

## 🛑 종료 방법

### 백엔드 종료
1. 백엔드 터미널 활성화
2. `Ctrl + C` 누르기
3. 종료 확인

### 프론트엔드 종료
1. 프론트엔드 터미널 활성화
2. `Ctrl + C` 누르기
3. `Y` 입력 후 Enter

---

## 🔄 재시작이 필요한 경우

### 코드 변경 시
- **백엔드**: 터미널에서 `Ctrl + C` → `gradlew.bat bootRun`
- **프론트엔드**: 자동 새로고침 (저장만 하면 됨)

### 데이터베이스 변경 시
```cmd
# 백엔드를 재시작하거나
# MySQL에서 직접 변경
mysql -u root -p choprest
```

---

## ❌ 문제 해결

### 포트가 이미 사용 중입니다
```cmd
# 8080 포트 사용 프로세스 확인 (백엔드)
netstat -ano | findstr :8080

# 3000 포트 사용 프로세스 확인 (프론트엔드)
netstat -ano | findstr :3000

# 프로세스 종료 (PID 확인 후)
taskkill /PID [프로세스ID] /F
```

### MySQL 접속 오류
```cmd
# application.properties 확인
# src/main/resources/application.properties

# MySQL 사용자명/비밀번호 확인
spring.datasource.username=root
spring.datasource.password=your_password
```

### npm install 오류
```cmd
# 캐시 삭제 후 재설치
cd frontend
rd /s /q node_modules
del package-lock.json
npm install
```

### 백엔드 빌드 오류
```cmd
# 클린 빌드
gradlew.bat clean
gradlew.bat build --refresh-dependencies
```

---

## 📝 체크리스트

실행 전 확인사항:

- [ ] Java 17+ 설치 확인
- [ ] Node.js 설치 확인
- [ ] MySQL 실행 확인
- [ ] choprest 데이터베이스 생성
- [ ] 테스트 데이터 삽입 (선택)
- [ ] 백엔드 실행 (8080 포트)
- [ ] 프론트엔드 실행 (3000 포트)
- [ ] 브라우저 접속 테스트

---

## 🎓 추가 팁

### 개발 모드에서 유용한 명령어

```cmd
# 백엔드 로그 레벨 변경
# application.properties에서:
logging.level.root=DEBUG

# 프론트엔드 빌드 (배포용)
cd frontend
npm run build

# 백엔드 테스트 실행
gradlew.bat test
```

### 데이터 초기화
```cmd
# 데모 데이터 삭제
mysql -u root -p choprest < demo-cleanup.sql

# 다시 생성
mysql -u root -p choprest < demo-test-data-v2.sql
```

---

## 🆘 도움이 필요하면

1. **에러 메시지 확인**: 터미널의 빨간 글씨 확인
2. **로그 확인**: 백엔드 터미널의 전체 로그 읽기
3. **브라우저 콘솔**: F12 → Console 탭 확인
4. **README.md**: 프로젝트 문서 참고

---

## 🎉 성공!

모든 단계가 완료되면:
- ✅ 백엔드: http://localhost:8080
- ✅ 프론트엔드: http://localhost:3000
- ✅ 데모 로그인: http://localhost:3000/demo/login

**Happy Coding! 🚀**


