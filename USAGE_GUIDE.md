# 🍽️ 찹플랜(ChopPlan) 사용설명서

## 📋 목차
1. [개발 환경 설정](#개발-환경-설정)
2. [백엔드 서버 실행](#백엔드-서버-실행)
3. [프론트엔드 실행](#프론트엔드-실행)
4. [AWS 배포](#aws-배포)
5. [문제 해결](#문제-해결)

---

## 🔧 개발 환경 설정

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd choprest
```

### 2. 백엔드 의존성 설치
```bash
# Windows
gradlew.bat build

# Linux/Mac
./gradlew build
```

### 3. 프론트엔드 의존성 설치
```bash
cd frontend
npm install
```

---

## 🚀 백엔드 서버 실행

### 1. 로컬에서 실행
```bash
# Windows
gradlew.bat bootRun

# Linux/Mac
./gradlew bootRun
```

### 2. JAR 파일로 실행
```bash
# 빌드
gradlew.bat clean build

# 실행
java -jar build/libs/choprest-0.0.1-SNAPSHOT.jar
```

### 3. API 테스트
```bash
# 모든 식당 조회
curl http://localhost:8080/api/restaurants/all

# 키워드 검색
curl "http://localhost:8080/api/restaurants?keyword=서울"
curl "http://localhost:8080/api/restaurants?keyword=강남"
```

---

## 🎨 프론트엔드 실행

### 1. 개발 서버 실행
```bash
cd frontend
npm start
```
- URL: http://localhost:3000

### 2. 프로덕션 빌드
```bash
cd frontend
npm run build
```

### 3. 빌드된 파일 서빙
```bash
cd frontend
npx serve -s build
```

---

## ☁️ AWS 배포

### 1. EC2 서버 배포

#### JAR 파일 업로드
```cmd
scp -i chopplan.pem build\libs\choprest-0.0.1-SNAPSHOT.jar ubuntu@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:~/
```

#### EC2 접속
```cmd
ssh -i chopplan.pem ubuntu@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com
```

#### EC2에서 서버 실행
```bash
# 기존 프로세스 종료
pkill -f choprest

# 기존 JAR 파일 삭제
rm -f *.jar

# 서버 실행 (UTF-8 설정)
nohup java -Dfile.encoding=UTF-8 -Dspring.http.encoding.charset=UTF-8 -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &

# 실행 확인
ps aux | grep java

# 로그 확인
tail -f app.log
```

### 2. 프론트엔드 배포

#### S3 업로드
```cmd
cd frontend
npm run build
aws s3 sync build/ s3://chopplandemo-app --delete
```

#### CloudFront 캐시 무효화
```cmd
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
```

---

## 🔍 문제 해결

### 1. 한글 인코딩 문제
```bash
# 서버 재시작 (UTF-8 설정)
pkill -f choprest
nohup java -Dfile.encoding=UTF-8 -Dspring.http.encoding.charset=UTF-8 -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

### 2. Mixed Content 문제
- Chrome: 주소창 자물쇠 아이콘 → 사이트 설정 → 안전하지 않은 콘텐츠 허용
- Firefox: about:config → security.mixed_content.block_active_content → false

### 3. 포트 문제
```bash
# 포트 사용 확인
netstat -tulpn | grep 8080

# 프로세스 종료
pkill -f choprest
```

### 4. 데이터베이스 연결 문제
```bash
# 로그 확인
tail -f app.log

# 데이터베이스 테스트
curl http://localhost:8080/api/restaurants/all
```

---

## 📱 API 엔드포인트

### 1. 검색 API
```bash
# 키워드 검색
GET /api/restaurants?keyword={검색어}

# 지역별 검색
GET /api/restaurants/region?region={지역명}

# 식당명 검색
GET /api/restaurants/name?name={식당명}
```

### 2. 관리 API
```bash
# 모든 식당 조회
GET /api/restaurants/all

# 특정 식당 조회
GET /api/restaurants/{id}

# 식당 삭제
DELETE /api/restaurants?keyword={검색어}
```

---

## 🌐 접속 URL

### 개발 환경
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api

### 프로덕션 환경
- 프론트엔드: https://dpt8rhufx9b4x.cloudfront.net
- 백엔드 API: http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:8080/api

---

## 🛠️ 유용한 명령어

### EC2 관리
```bash
# 서버 상태 확인
ps aux | grep java

# 로그 실시간 확인
tail -f app.log

# 서버 재시작
pkill -f choprest && sleep 2 && nohup java -Dfile.encoding=UTF-8 -Dspring.http.encoding.charset=UTF-8 -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

### AWS CLI
```bash
# S3 업로드
aws s3 sync build/ s3://chopplandemo-app --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"

# EC2 인스턴스 상태 확인
aws ec2 describe-instances --instance-ids i-0a6be90442eaf1c16
```

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 확인: tail -f app.log
2. 포트 확인: netstat -tulpn | grep 8080
3. 프로세스 확인: ps aux | grep java
4. API 테스트: curl http://localhost:8080/api/restaurants/all

Happy Coding! 🚀
