# 📥 DBeaver로 Cloud SQL에 데이터 가져오기 (1분 완료)

## 🎯 가장 쉬운 방법!

"데이터 가져오기" 버튼이 없어도 걱정 없습니다. DBeaver로 바로 할 수 있습니다!

---

## ✅ 3단계로 완료

### Step 1: 백업 파일 생성

```bash
create-gcp-backup-simple.bat
```

결과: `chopplan_backup.sql` 파일 생성됨

---

### Step 2: Cloud SQL에 DBeaver로 연결

**이미 Step 4에서 연결했다면 이 단계 생략 가능**

1. **DBeaver** 실행
2. **새 데이터베이스 연결** (Ctrl+Shift+N) 또는 기존 연결 사용
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
6. **완료**

---

### Step 3: SQL 파일 실행

1. DBeaver에서 Cloud SQL 연결 선택
2. **SQL 편집기** 열기:
   - 상단 메뉴: **SQL 편집기** > **새 SQL 편집기**
   - 또는 `Ctrl+\` 단축키
3. **파일 열기**:
   - 방법 A: `chopplan_backup.sql` 파일을 드래그 앤 드롭
   - 방법 B: 상단 메뉴: **파일** > **열기** > `chopplan_backup.sql` 선택
4. **실행**:
   - 상단 **▶ 실행** 버튼 클릭
   - 또는 `Ctrl+Enter` 단축키
5. 완료 메시지 확인

---

## ✅ 완료!

**이제 Cloud SQL에 데이터가 들어갔습니다!**

확인:
```sql
SELECT COUNT(*) FROM restaurants;
```

---

## 💡 팁

- 파일 크기가 작아서(0.27MB) 몇 초 안에 완료됩니다
- 에러가 있으면 DBeaver 하단 **로그** 탭에서 확인 가능
- 성공하면 "X rows affected" 메시지가 표시됩니다

---

## 🎉 이게 가장 쉽습니다!

Cloud Console에서 버튼을 찾을 필요 없이 DBeaver에서 바로 할 수 있습니다!



