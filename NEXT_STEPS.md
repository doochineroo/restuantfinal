# 🚀 다음 단계 가이드

## ✅ 현재 완료된 작업

1. ✅ 데이터베이스 이름: `chopplan`으로 변경
2. ✅ MySQL 비밀번호: `1234` 확인 및 설정
3. ✅ `chopplan` 데이터베이스 생성 완료
4. ✅ Google Cloud SQL 설정 파일 준비

## 📋 다음 해야 할 일

### 1단계: 백엔드 실행 (테이블 자동 생성)

```bash
gradlew.bat bootRun
```

**이 작업이 하는 일:**
- JPA가 모든 `@Entity` 클래스의 테이블을 자동 생성
- `restaurants`, `demo_users`, `notifications` 등 모든 테이블 생성
- 애플리케이션이 정상 실행되는지 확인

**정상 실행 확인:**
- 로그에 `Started ChoprestApplication` 메시지 확인
- `http://localhost:8080/api/restaurants` 접속 테스트

### 2단계: 좌표 없는 레스토랑 삭제 (데이터베이스 크기 절약)

백엔드가 실행되면 **다른 터미널**에서:

#### 방법 1: API 사용 (권장)
```bash
# 통계 확인
curl http://localhost:8080/api/restaurants/statistics/coordinates

# 삭제 실행
curl -X DELETE http://localhost:8080/api/restaurants/cleanup/without-coordinates
```

또는 스크립트 사용:
```bash
./cleanup-via-api.bat
```

#### 방법 2: SQL 직접 실행
```bash
mysql -u root -p1234 chopplan
```

```sql
-- 삭제 전 확인
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coordinates
FROM restaurants;

-- 삭제 실행
DELETE FROM restaurants WHERE lat IS NULL OR lng IS NULL;

-- 최적화
OPTIMIZE TABLE restaurants;

EXIT;
```

### 3단계: 프론트엔드 실행

```bash
cd frontend
npm start
```

브라우저에서 `http://localhost:3000` 접속하여 확인

### 4단계: Google Cloud SQL로 마이그레이션 (나중에)

#### 백업 생성
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

#### Google Cloud SQL 설정
1. Google Cloud Console에서 Cloud SQL 인스턴스 생성
2. `application-gcp.properties` 파일 수정:
   ```properties
   spring.datasource.url=jdbc:mysql://[YOUR_INSTANCE_IP]:3306/chopplan?...
   spring.datasource.password=[YOUR_PASSWORD]
   ```

3. 데이터 복구:
   ```bash
   mysql -h [CLOUD_SQL_IP] -u root -p chopplan < chopplan_backup.sql
   ```

4. 프로파일 변경하여 실행:
   ```bash
   java -jar app.jar --spring.profiles.active=gcp
   ```

## 📊 체크리스트

- [ ] 백엔드 실행 (`gradlew.bat bootRun`)
- [ ] 테이블 자동 생성 확인 (DBeaver에서 확인)
- [ ] 좌표 없는 레스토랑 삭제
- [ ] 프론트엔드 실행 (`cd frontend && npm start`)
- [ ] 전체 동작 확인
- [ ] 데이터 백업 (나중에 마이그레이션용)

## 🎯 우선순위

1. **지금 할 일**: 백엔드 실행해서 테이블 생성 확인
2. **그 다음**: 좌표 없는 레스토랑 삭제
3. **나중에**: Google Cloud SQL로 마이그레이션





