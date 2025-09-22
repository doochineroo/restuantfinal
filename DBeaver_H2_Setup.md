# DBeaver로 H2 데이터베이스 연결하기

## 🔧 H2 데이터베이스 연결 설정

### 1. DBeaver에서 새 연결 생성
1. **DBeaver 실행**
2. **새 연결 생성**: `Database` → `New Database Connection`
3. **데이터베이스 선택**: `H2` 선택
4. **Next** 클릭

### 2. H2 연결 정보 입력
```
Connection name: ChopRest H2 Database
Server Host: localhost
Port: 8080
Database: /h2-console
User: sa
Password: (비워두기)
```

### 3. 드라이버 설정
- **Driver**: H2 (Embedded)
- **URL**: `jdbc:h2:mem:testdb`
- **User**: `sa`
- **Password**: (비워두기)

### 4. 연결 테스트
- **Test Connection** 클릭
- 성공하면 **Finish** 클릭

### 5. Spring Boot 애플리케이션 실행
```bash
# 프로젝트 루트에서
./gradlew bootRun
```

### 6. H2 콘솔 접속
- 브라우저에서 `http://localhost:8080/h2-console` 접속
- JDBC URL: `jdbc:h2:mem:testdb`
- User Name: `sa`
- Password: (비워두기)

### 7. DBeaver에서 데이터 확인
- 연결 후 `RESTAURANT` 테이블 확인
- 데이터 조회 및 관리 가능

## ⚠️ 주의사항
- H2는 인메모리 데이터베이스로 애플리케이션 재시작 시 데이터가 사라집니다
- 개발/테스트용으로만 사용 권장
- 프로덕션에서는 PostgreSQL 등 영구 저장소 사용

