# 🍽️ ChopPlan - 식당 예약 시스템

**사이트 이름: ChopPlan (촙플랜)**

## 🚀 Google Cloud 배포 (Always Free 티어)

### 배포 가이드
자세한 배포 가이드는 [GCP_COMPLETE_DEPLOYMENT_GUIDE.md](GCP_COMPLETE_DEPLOYMENT_GUIDE.md)를 참고하세요.

### 빠른 배포 (로컬에서 실행)

#### 1. 백엔드 빌드 및 배포
```bash
# 빌드
gradlew.bat clean build

# Google Cloud VM으로 파일 전송
gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a

# 프론트엔드 파일 전송
gcloud compute scp --recurse frontend/build/* chopplan-server:chopplan/static/ --zone=us-west1-a

# 애플리케이션 재시작
gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java && sleep 2 && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"
```

#### 2. 외부 IP 확인
```bash
gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

#### 3. 접속
- 프론트엔드: `http://[EXTERNAL_IP]:8080`
- 백엔드 API: `http://[EXTERNAL_IP]:8080/api`

## 📋 개발 환경 설정

### 백엔드
- Java 17+
- Spring Boot
- MySQL (로컬 또는 Google Cloud VM 내부 MySQL)
- Gradle

### 🆓 무료 데이터베이스 설정
Google Cloud VM 내부에 MySQL을 설치하여 사용합니다 (Always Free 티어).

**빠른 설정:**
1. XAMPP 설치: https://www.apachefriends.org/download.html
2. XAMPP Control Panel에서 MySQL 시작
3. 데이터베이스 생성:
   ```sql
   CREATE DATABASE `restaurant-demo`;
   ```
4. 자동 설정 스크립트 실행:
   ```bash
   setup-local-database.bat
   ```

자세한 가이드는 [LOCAL_DATABASE_SETUP.md](LOCAL_DATABASE_SETUP.md)를 참고하세요.

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

#### 프론트엔드 환경 변수 설정
프로덕션 배포 전에 `frontend/.env.production` 파일을 생성하세요:

```env
# Google Cloud VM 외부 IP로 변경 필요
REACT_APP_API_BASE_URL=http://[EXTERNAL_IP]:8080/api
PUBLIC_URL=/
```

외부 IP 확인 방법:
```bash
gcloud compute instances describe chopplan-server --zone=us-west1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

#### 기타 설정
- Kakao API Key: `0daaba62d376e0a4633352753a28827c`

## 📱 모바일 최적화
- 지도 토글 버튼 (모바일에서만 표시)
- 터치 스크롤 우선 처리
- 반응형 레이아웃

## 🎯 향후 계획
- [ ] 관리자 페이지 (status 수정 기능)
- [ ] 예약 API 연동
- [ ] 사용자 인증 시스템
