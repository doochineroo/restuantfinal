# restuantfinal
1. 로컬 CMD:
REM 빌드
gradlew.bat clean build
```

#### EC2로 파일 전송
```bash
scp -i chopplan.pem build\libs\choprest-0.0.1-SNAPSHOT.jar ubuntu@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:~/
```

#### EC2 접속
```bash
ssh -i chopplan.pem ubuntu@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com
```

### 2. EC2에서 실행
```bash
# 기존 Java 프로세스 종료
pkill -f java

# 새 버전 실행
nohup java -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &

# 로그 확인
tail -f app.log
```

### 3. 프론트엔드 배포 (로컬)
```bash
cd frontend
npm run build
cd ..
aws s3 sync frontend\build/ s3://chopplandemo-app --delete
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
```

## 📋 개발 환경 설정

### 백엔드
- Java 17+
- Spring Boot
- MySQL (AWS RDS)
- Gradle

### 프론트엔드
- React 18
- Kakao Map API
- Axios

## 🎨 커스텀 커서 적용
자세한 가이드는 `frontend/CURSOR_GUIDE.md`를 참고하세요.

```css
/* frontend/src/App.css - 19번째 줄 */
body {
  cursor: url('/cursor.png'), auto;
}
```

## 📊 데이터 구조

### Restaurant 엔티티
- `status`: 운영 상태 (NORMAL: 운영중, CLOSED: 운영중지 예상)
- `lat`, `lng`: 좌표 (null이면 지도에 표시 안 됨)
- `parking`, `wifi`, `kidsZone`, `delivery`: 서비스 정보 (Y/N)

## 🔧 주요 설정

### application.properties
- 로깅 레벨: WARN (프로덕션)
- JPA SQL 출력: false
- MySQL 연결 정보

### 환경 변수
- Kakao API Key: `0daaba62d376e0a4633352753a28827c`
- CloudFront URL: `https://dpt8rhufx9b4x.cloudfront.net`

## 📱 모바일 최적화
- 지도 토글 버튼 (모바일에서만 표시)
- 터치 스크롤 우선 처리
- 반응형 레이아웃

## 🎯 향후 계획
- [ ] 관리자 페이지 (status 수정 기능)
- [ ] 예약 API 연동
- [ ] 사용자 인증 시스템
