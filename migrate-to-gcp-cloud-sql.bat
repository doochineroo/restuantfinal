@echo off
REM 로컬 MySQL 데이터베이스를 Google Cloud SQL로 마이그레이션

chcp 65001 >nul
echo ============================================
echo    로컬 DB → Google Cloud SQL 마이그레이션
echo ============================================
echo.

echo [1단계] 현재 데이터베이스 확인...
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) as total FROM restaurants; SELECT COUNT(*) as total FROM demo_users;"
echo.

echo [2단계] 데이터베이스 덤프 생성...
echo    파일: chopplan_backup.sql
echo.

mysqldump -u root -p1234 chopplan > chopplan_backup.sql

if %errorlevel% neq 0 (
    echo ❌ 덤프 생성 실패!
    pause
    exit /b 1
)

echo ✅ 덤프 파일 생성 완료: chopplan_backup.sql
echo.

echo [3단계] 파일 크기 확인...
for %%F in (chopplan_backup.sql) do echo    크기: %%~zF bytes
echo.

echo [4단계] 다음 단계:
echo.
echo    방법 1: Cloud SQL Console에서 가져오기
echo    1. Google Cloud Console 접속
echo    2. Cloud SQL 인스턴스 선택
echo    3. 가져오기 탭 클릭
echo    4. SQL 덤프 파일 선택 (chopplan_backup.sql)
echo.
echo    방법 2: gcloud CLI 사용
echo    gcloud sql import sql [INSTANCE_NAME] gs://[BUCKET]/chopplan_backup.sql --database=chopplan
echo.
echo    방법 3: Cloud SQL Proxy 사용 (추천)
echo    - Cloud SQL Proxy 설치 및 실행
echo    - 로컬 MySQL처럼 접근하여 직접 가져오기
echo.

echo ✅ 덤프 파일이 생성되었습니다!
echo    경로: %CD%\chopplan_backup.sql
echo.
pause



