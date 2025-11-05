@echo off
REM 간단한 데이터베이스 백업 생성

chcp 65001 >nul
echo ============================================
echo    데이터베이스 백업 생성
echo ============================================
echo.

echo 현재 데이터베이스 덤프 생성 중...
echo.

REM 데이터베이스 선택 명령어 포함하여 덤프 생성
mysqldump -u root -p1234 --databases chopplan > chopplan_backup.sql

if %errorlevel% equ 0 (
    echo ✅ 백업 파일 생성 완료!
    echo.
    echo 파일 위치: %CD%\chopplan_backup.sql
    echo.
    echo 다음 단계:
    echo 1. Google Cloud Console 접속
    echo 2. Cloud SQL 인스턴스 선택
    echo 3. "가져오기" 탭 클릭
    echo 4. 이 파일 업로드
    echo.
) else (
    echo ❌ 백업 생성 실패!
    echo 비밀번호를 확인하세요.
    echo.
)

pause

