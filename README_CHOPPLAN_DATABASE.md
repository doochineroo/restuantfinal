# 🗄️ chopplan 데이터베이스 설정 가이드

## ✅ 변경 완료 사항

1. ✅ 데이터베이스 이름: `restaurant-demo` → `chopplan`으로 변경
2. ✅ JPA 자동 테이블 생성 설정 확인 (`ddl-auto=update`)
3. ✅ Google Cloud SQL 설정 파일 준비 (`application-gcp.properties`)

## 🚀 빠른 시작

### 1단계: 데이터베이스 생성

```bash
setup-chopplan-database.bat
```

이 스크립트가:
- MySQL 서버 확인
- `chopplan` 데이터베이스 생성
- 설정 확인

### 2단계: 백엔드 실행 (테이블 자동 생성)

```bash
gradlew.bat bootRun
```

**JPA가 자동으로 다음 테이블들을 생성합니다:**
- `restaurants` - 레스토랑 정보
- `demo_users` - 사용자 정보
- `demo_reservations` - 예약 정보
- `demo_reviews` - 리뷰
- `demo_chat_rooms` - 채팅방
- `demo_chat_messages` - 채팅 메시지
- `demo_blacklist` - 블랙리스트
- `notifications` - 알림
- `search_keywords` - 검색어 통계
- `restaurant_clicks` - 레스토랑 클릭 통계
- `user_favorites` - 즐겨찾기
- `MENU` - 메뉴 정보
- `EVENTS` - 이벤트 정보
- `ADDITIONAL_INFO` - 추가 정보

### 3단계: 확인

DBeaver나 MySQL Workbench에서 확인:
```
Host: localhost
Port: 3306
Database: chopplan
Username: root
Password: chopplan123 (또는 설정한 비밀번호)
```

## 📋 데이터베이스 구조

### 주요 테이블

| 테이블명 | 설명 |
|---------|------|
| `restaurants` | 레스토랑 정보 |
| `demo_users` | 사용자 정보 (데모용) |
| `demo_reservations` | 예약 정보 |
| `demo_reviews` | 리뷰 |
| `demo_chat_rooms` | 채팅방 |
| `demo_chat_messages` | 채팅 메시지 |
| `notifications` | 알림 |
| `search_keywords` | 검색어 통계 |
| `restaurant_clicks` | 클릭 통계 |
| `user_favorites` | 즐겨찾기 |
| `MENU` | 메뉴 |
| `EVENTS` | 이벤트 |

## 🔄 Google Cloud SQL로 마이그레이션 (나중에)

### 1. 데이터 백업

```bash
# 로컬 데이터베이스 백업
mysqldump -u root -p chopplan > chopplan_backup.sql
```

### 2. Google Cloud SQL 설정

1. Google Cloud Console에서 Cloud SQL 인스턴스 생성
2. `application-gcp.properties` 파일 수정:
   ```properties
   spring.datasource.url=jdbc:mysql://[YOUR_INSTANCE_IP]:3306/chopplan?...
   spring.datasource.password=[YOUR_CLOUD_SQL_PASSWORD]
   ```

3. 데이터 복구:
   ```bash
   mysql -h [YOUR_INSTANCE_IP] -u root -p chopplan < chopplan_backup.sql
   ```

### 3. 애플리케이션 실행

```bash
# Google Cloud SQL 사용
java -jar app.jar --spring.profiles.active=gcp
```

## 💾 데이터 복구 방법

### 백업 생성

```bash
# 전체 데이터베이스 백업
mysqldump -u root -p chopplan > backup_chopplan_$(date +%Y%m%d).sql

# 특정 테이블만 백업
mysqldump -u root -p chopplan restaurants > backup_restaurants.sql
```

### 복구

```bash
# 전체 복구
mysql -u root -p chopplan < backup_chopplan_20251103.sql

# 특정 테이블 복구
mysql -u root -p chopplan < backup_restaurants.sql
```

## ⚙️ 설정 파일

- **로컬 개발**: `application.properties` (기본)
- **Google Cloud SQL**: `application-gcp.properties`
- **AWS RDS**: `application-aws.properties` (사용 안 함)

## ✅ 체크리스트

- [ ] MySQL 서버 실행 중
- [ ] `chopplan` 데이터베이스 생성 완료
- [ ] 백엔드 실행 성공 (테이블 자동 생성)
- [ ] DBeaver 연결 확인
- [ ] 데이터 백업 계획 수립

## 📝 참고

- 테이블은 `@Entity` 어노테이션이 있는 클래스로부터 자동 생성됩니다
- `ddl-auto=update`는 엔티티 변경 시 테이블을 자동으로 업데이트합니다
- 프로덕션 환경에서는 `ddl-auto=validate` 또는 `none` 사용 권장





