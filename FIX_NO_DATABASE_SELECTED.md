# 🔧 "No database selected" 에러 해결

## ❌ 에러 메시지

```
ERROR 1046 (3D000) at line 22: No database selected
```

**원인**: SQL 파일에 데이터베이스를 선택하는 명령어가 없음

---

## ✅ 해결 방법

### 방법 1: --databases 옵션으로 새로 덤프 생성 (추천)

**새 스크립트 실행:**
```bash
create-gcp-backup-fixed.bat
```

이 스크립트는 `--databases` 옵션을 사용하여 `USE chopplan;` 명령어를 자동으로 포함합니다.

**또는 직접 실행:**
```bash
mysqldump -u root -p1234 --databases chopplan > chopplan_backup_gcp.sql
```

**차이점:**
- 기존: `mysqldump chopplan` → USE 명령어 없음
- 수정: `mysqldump --databases chopplan` → USE 명령어 포함 ✅

---

### 방법 2: 기존 파일에 USE 명령어 추가

**기존 `chopplan_backup.sql` 파일 수정:**

1. 파일 열기
2. **맨 첫 줄**에 다음 추가:
   ```sql
   USE chopplan;
   ```
3. 저장

---

### 방법 3: DBeaver에서 데이터베이스 선택 후 실행

1. **DBeaver**에서 Cloud SQL 연결
2. `chopplan` 데이터베이스 선택 (왼쪽 트리에서)
3. **SQL 편집기** 열기
4. SQL 파일 실행

이렇게 하면 자동으로 `chopplan` 데이터베이스가 선택됩니다.

---

## 🎯 가장 쉬운 해결

**새 덤프 파일 생성:**
```bash
create-gcp-backup-fixed.bat
```

**그 다음 DBeaver에서:**
1. Cloud SQL 연결
2. SQL 편집기 열기
3. 새로 생성된 `chopplan_backup_gcp.sql` 파일 열기
4. 실행

**끝!** 🎉

---

## 📝 왜 이런 에러가 발생했나요?

**일반 덤프:**
```sql
-- USE 명령어 없음
CREATE TABLE restaurants (...);
```

**--databases 옵션 사용:**
```sql
CREATE DATABASE IF NOT EXISTS `chopplan`;
USE `chopplan`;  ← 이 명령어가 포함됨
CREATE TABLE restaurants (...);
```

`--databases` 옵션을 사용하면 자동으로 데이터베이스 선택 명령어가 포함됩니다!



