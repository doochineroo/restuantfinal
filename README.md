# 🍽️ ChopPlan - 식당 예약 시스템

**사이트 이름: ChopPlan (촙플랜)**

## 🚀 빠른 시작

### 새로 시작하는 분
👉 [시작하기.md](시작하기.md) - 한국어 시작 가이드

### 로컬 개발
- [LOCAL_DATABASE_SETUP.md](LOCAL_DATABASE_SETUP.md) - 로컬 데이터베이스 설정
- [LOCAL_TEST_GUIDE.md](LOCAL_TEST_GUIDE.md) - 로컬 테스트 가이드
- `setup-local-database.bat` - 로컬 DB 자동 설정
- `quick-test-local.bat` - 로컬 테스트 실행

### GCP 배포
- [GCP_COMPLETE_DEPLOYMENT_GUIDE.md](GCP_COMPLETE_DEPLOYMENT_GUIDE.md) - 완전한 배포 가이드
- [LOCAL_WITH_CLOUD_SQL_GUIDE.md](LOCAL_WITH_CLOUD_SQL_GUIDE.md) - 로컬 + Cloud SQL 사용
- [GCP_CLOUD_SQL_실행방법.md](GCP_CLOUD_SQL_실행방법.md) - Cloud SQL 실행 방법
- `quick-deploy.bat` - 빠른 배포

## 📋 개발 환경 설정

### 백엔드
- Java 17+
- Spring Boot
- MySQL (로컬 또는 Google Cloud VM 내부 MySQL)
- Gradle

### 🆓 데이터베이스 설정

**로컬 개발:**
- `setup-local-database.bat` 실행
- 자세한 가이드: [LOCAL_DATABASE_SETUP.md](LOCAL_DATABASE_SETUP.md)

**GCP Cloud SQL:**
- 자세한 가이드: [LOCAL_WITH_CLOUD_SQL_GUIDE.md](LOCAL_WITH_CLOUD_SQL_GUIDE.md)

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

### 환경 변수 및 설정
자세한 설정 방법은 [APPLICATION_PROPERTIES_GUIDE.md](APPLICATION_PROPERTIES_GUIDE.md)를 참고하세요.

## 📱 모바일 최적화
- 지도 토글 버튼 (모바일에서만 표시)
- 터치 스크롤 우선 처리
- 반응형 레이아웃

## 📚 주요 가이드

| 가이드 | 설명 |
|--------|------|
| [시작하기.md](시작하기.md) | 처음 시작하는 분들을 위한 한국어 가이드 |
| [LOCAL_DATABASE_SETUP.md](LOCAL_DATABASE_SETUP.md) | 로컬 MySQL 데이터베이스 설정 |
| [LOCAL_TEST_GUIDE.md](LOCAL_TEST_GUIDE.md) | 로컬에서 테스트하는 방법 |
| [LOCAL_WITH_CLOUD_SQL_GUIDE.md](LOCAL_WITH_CLOUD_SQL_GUIDE.md) | 로컬에서 Cloud SQL 사용 |
| [GCP_COMPLETE_DEPLOYMENT_GUIDE.md](GCP_COMPLETE_DEPLOYMENT_GUIDE.md) | GCP 완전 배포 가이드 |
| [GCP_CLOUD_SQL_실행방법.md](GCP_CLOUD_SQL_실행방법.md) | Cloud SQL 프로파일로 실행 |
| [BATCH_UPDATE_GUIDE.md](BATCH_UPDATE_GUIDE.md) | 좌표 배치 업데이트 가이드 |
| [APPLICATION_PROPERTIES_GUIDE.md](APPLICATION_PROPERTIES_GUIDE.md) | 설정 파일 가이드 |

## 🛠️ 주요 스크립트

| 스크립트 | 설명 |
|----------|------|
| `setup-local-database.bat` | 로컬 데이터베이스 자동 설정 |
| `quick-test-local.bat` | 로컬 테스트 실행 |
| `quick-test-local-cloudsql.bat` | Cloud SQL 프로파일로 테스트 |
| `batch-update-coordinates.bat` | 좌표 배치 업데이트 |
| `quick-deploy.bat` | GCP 빠른 배포 |
| `QUICK_START.bat` | 빠른 시작 스크립트 |

## 🎯 향후 계획
- [ ] 관리자 페이지 (status 수정 기능)
- [ ] 예약 API 연동
- [ ] 사용자 인증 시스템
