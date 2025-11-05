@echo off
REM GCP용 데이터베이스 백업 생성 (데이터베이스 선택 포함)

chcp 65001 >nul
echo ============================================
echo    GCP용 데이터베이스 백업 생성
echo ============================================
echo.

echo 현재 데이터베이스 덤프 생성 중...
echo    --databases 옵션으로 데이터베이스 선택 명령어 포함
echo.

mysqldump -u root -p1234 --databases chopplan > chopplan_backup_gcp.sql

if %errorlevel% equ 0 (
    echo ✅ 백업 파일 생성 완료!
    echo.
    echo 파일 위치: %CD%\chopplan_backup_gcp.sql
    echo.
    echo 💡 이 파일은 USE chopplan; 명령어가 포함되어 있습니다.
    echo.
    echo 다음 단계:
    echo 1. DBeaver에서 Cloud SQL 연결
    echo 2. SQL 편집기 열기
    echo 3. 이 파일 열기
    echo 4. 실행
    echo.
) else (
    echo ❌ 백업 생성 실패!
    echo 비밀번호를 확인하세요.
    echo.
)

pause



