# 📦 Step 5: 데이터 마이그레이션 상세 가이드

## 🎯 목표
로컬 MySQL 데이터베이스를 Google Cloud SQL로 옮기기

---

## ✅ 방법 1: Google Cloud Console (가장 쉬움) ⭐ 추천

### 1단계: 백업 파일 생성

**스크립트 실행:**
```bash
create-gcp-backup-simple.bat
```

**또는 직접:**
```bash
mysqldump -u root -p1234 chopplan > chopplan_backup.sql
```

**확인:**
```bash
dir chopplan_backup.sql
```

---

### 2단계: Cloud Storage에 업로드

1. **Google Cloud Console** 접속: https://console.cloud.google.com
2. 좌측 메뉴: **Cloud Storage** > **버킷**
3. **버킷 만들기** 클릭
4. 설정:
   ```
   버킷 이름: chopplan-backups-[랜덤숫자] (고유해야 함)
   위치: asia-northeast2 (서울)
   저장소 클래스: Standard
   액세스 제어: 균등 액세스
   ```
5. **만들기**
6. 생성된 버킷 클릭
7. **파일 업로드** 클릭
8. `chopplan_backup.sql` 선택
9. **업로드** 완료 대기

---

### 3단계: Cloud SQL로 가져오기 ⭐

**방법 A: DBeaver 사용 (가장 쉬움) - 추천!**

1. **DBeaver** 실행
2. Cloud SQL 연결 (Step 4에서 설정한 연결)
3. **SQL 편집기** 열기 (Ctrl+\)
4. `chopplan_backup.sql` 파일 드래그 앤 드롭 또는 열기
5. **실행** 클릭 (Ctrl+Enter)
6. 완료 대기 (몇 초)

**방법 B: Cloud Console SQL 편집기**

1. **Cloud SQL** > 인스턴스 `chopplan-db` 선택
2. **쿼리** 또는 **SQL 편집기** 탭 클릭
3. **새 쿼리** 클릭
4. `chopplan_backup.sql` 파일 내용 복사하여 붙여넣기
5. **실행** 클릭

**방법 C: 데이터 가져오기 버튼 찾기 (UI가 다른 경우)**

다음 위치들을 확인해보세요:
- 인스턴스 개요 페이지 상단
- 데이터베이스 탭 > `chopplan` 데이터베이스 클릭
- 작업 탭
- 설정 > 데이터 가져오기/내보내기

---

### 4단계: 데이터 확인

**Cloud SQL에서 확인:**

1. **데이터베이스** 탭에서 `chopplan` 클릭
2. **쿼리** 탭 (또는 DBeaver 등으로 연결)
3. 쿼리 실행:
   ```sql
   SELECT COUNT(*) as total_restaurants FROM restaurants;
   SELECT COUNT(*) as total_users FROM demo_users;
   ```

**예상 결과:**
- restaurants: 999개 (또는 현재 개수)
- 다른 테이블들 확인

---

## ✅ 방법 2: DBeaver 사용 (GUI, 추천)

### 1단계: Cloud SQL 연결 설정

1. **DBeaver** 실행
2. **새 데이터베이스 연결** (Ctrl+Shift+N)
3. **MySQL** 선택
4. 설정:
   ```
   호스트: [Cloud SQL Public IP]
   포트: 3306
   데이터베이스: chopplan
   사용자 이름: root
   비밀번호: [GCP에서 설정한 비밀번호]
   ```
5. **테스트 연결** 클릭
6. **완료** 클릭

---

### 2단계: 백업 파일 생성

```bash
create-gcp-backup-simple.bat
```

---

### 3단계: SQL 파일 실행

1. **SQL 편집기** 열기 (Ctrl+\)
2. **파일** > **열기** 또는 `chopplan_backup.sql` 드래그 앤 드롭
3. **실행** (Ctrl+Enter 또는 ▶ 버튼)
4. 완료 대기

---

## ✅ 방법 3: Cloud SQL Proxy 사용 (고급)

### 1단계: Proxy 다운로드

```bash
# PowerShell
Invoke-WebRequest -Uri "https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe" -OutFile "cloud_sql_proxy.exe"
```

### 2단계: Proxy 실행

```bash
# 연결 이름 확인 (Cloud SQL > 개요 > 연결 이름)
cloud_sql_proxy.exe -instances=[PROJECT_ID]:asia-northeast2:chopplan-db=tcp:3307
```

**연결 이름 형식**: `[프로젝트ID]:[리전]:[인스턴스명]`

### 3단계: 데이터 가져오기

```bash
# 새로운 터미널에서
mysql -u root -p[GCP_PASSWORD] -h 127.0.0.1 -P 3307 chopplan < chopplan_backup.sql
```

---

## 🔍 마이그레이션 확인

### 로컬과 GCP 비교

**로컬:**
```bash
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) FROM restaurants;"
```

**GCP (DBeaver 또는 MySQL 클라이언트):**
```sql
SELECT COUNT(*) FROM restaurants;
```

**두 결과가 같아야 합니다!**

---

## ⚠️ 주의사항

1. **데이터베이스 미리 생성**: Step 3에서 `chopplan` 데이터베이스를 먼저 생성해야 합니다
2. **파일 크기**: 현재 0.27MB이므로 매우 빠르게 완료됩니다
3. **연결 확인**: 가져오기 전에 Cloud SQL에 연결 가능한지 확인

---

## 🎉 완료!

마이그레이션 완료 후:
1. `application-gcp.properties` 업데이트
2. 애플리케이션 연결 테스트

---

## 📝 체크리스트

- [ ] 로컬 백업 파일 생성 (`chopplan_backup.sql`)
- [ ] Cloud Storage 버킷 생성 및 업로드
- [ ] Cloud SQL에서 데이터 가져오기 실행
- [ ] 데이터 확인 (레코드 수 비교)
- [ ] 애플리케이션 연결 테스트

---

## 💡 추천 순서

1. **방법 2 (DBeaver)**: 가장 간단하고 빠름 ⭐
2. **방법 1 (Cloud Console)**: 공식 방법, 안정적
3. **방법 3 (Proxy)**: 고급 사용자용

