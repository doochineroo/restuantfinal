@echo off
chcp 65001 >nul
echo ============================================
echo 채팅 테이블 생성 스크립트 실행
echo ============================================
echo.

REM 현재 디렉토리에서 실행
cd /d "%~dp0"

echo MySQL 연결 정보:
echo   Host: chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com
echo   Port: 3306
echo   User: admin
echo   Database: restaurant-demo
echo.

REM MySQL 클라이언트가 PATH에 있는지 확인
where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [오류] MySQL 클라이언트를 찾을 수 없습니다.
    echo MySQL이 설치되어 있고 PATH에 추가되어 있는지 확인하세요.
    echo.
    echo 대안: MySQL Workbench를 사용하세요.
    pause
    exit /b 1
)

echo SQL 파일 실행 중...
mysql -h chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com -P 3306 -u admin -pchopplan123 restaurant-demo < create_chat_tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo [성공] 테이블 생성 완료!
    echo ============================================
    echo demo_chat_rooms 테이블이 생성되었습니다.
    echo demo_chat_messages 테이블이 생성되었습니다.
) else (
    echo.
    echo ============================================
    echo [오류] 테이블 생성 실패!
    echo ============================================
    echo.
    echo 가능한 원인:
    echo   1. MySQL 클라이언트가 설치되지 않음
    echo   2. 네트워크 연결 문제
    echo   3. 데이터베이스 접근 권한 문제
    echo.
    echo 해결 방법:
    echo   - MySQL Workbench를 사용하여 수동으로 SQL 실행
    echo   - 또는 백엔드 서버를 재시작하여 JPA가 자동으로 생성하도록 함
)

echo.
pause

