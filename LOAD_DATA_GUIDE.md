# 📥 데이터 로드 가이드

## ✅ 자동 로드 (가장 간단)

백엔드를 실행하면 **자동으로 CSV에서 데이터를 로드**합니다!

```bash
gradlew.bat bootRun
```

**작동 방식:**
- 애플리케이션이 시작될 때 데이터베이스를 확인
- 데이터가 없으면 `src/main/resources/restaurants.csv`에서 자동 로드
- 약 1000개의 레스토랑 데이터가 자동으로 저장됨

**확인:**
- 로그에 `Successfully loaded X restaurants from CSV to database` 메시지 확인
- 또는 데이터베이스 확인: `./quick-check-db.bat`

## 🔄 수동 로드 방법

### 방법 1: 백엔드 재시작

데이터가 로드되지 않았다면 백엔드를 재시작:

```bash
# 1. 기존 백엔드 중지 (Ctrl+C)
# 2. 다시 실행
gradlew.bat bootRun
```

### 방법 2: SQL로 직접 로드

```bash
mysql -u root -p1234 chopplan
```

데이터베이스가 비어있다면 CSV 파일에서 수동으로 로드할 수 있지만, 백엔드가 자동으로 해주므로 굳이 필요하지 않습니다.

### 방법 3: 기존 데이터 복구 (AWS RDS에서 백업이 있는 경우)

만약 AWS RDS에서 백업 파일이 있다면:

```bash
mysql -u root -p1234 chopplan < backup_file.sql
```

## 📊 CSV 파일 위치

- `src/main/resources/restaurants.csv` - 백엔드가 읽는 파일
- 약 1000개의 레스토랑 데이터 포함

## ⚠️ 주의사항

- **데이터가 이미 있으면 로드하지 않음**: 백엔드가 데이터베이스를 확인하고, 이미 데이터가 있으면 CSV 로드를 건너뜁니다
- **강제로 다시 로드하려면**: 데이터베이스를 비우거나 백엔드 로직을 수정해야 합니다

## 🎯 지금 할 일

**그냥 백엔드를 실행하세요!**

```bash
gradlew.bat bootRun
```

백엔드가 자동으로:
1. 데이터베이스 확인
2. 비어있으면 CSV에서 로드
3. 모든 레스토랑 데이터 저장

로그에서 다음 메시지를 확인하세요:
```
✅ Successfully loaded X restaurants from CSV to database
```

## ✅ 확인

백엔드 실행 후:

```bash
# 다른 터미널에서
./quick-check-db.bat
```

또는:
```bash
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) FROM restaurants;"
```

결과가 0보다 크면 데이터가 로드된 것입니다!





