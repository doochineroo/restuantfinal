@echo off
echo ============================================
echo 채팅 테이블 생성 스크립트
echo ============================================
echo.

echo MySQL에 연결하여 테이블을 생성합니다...
echo 데이터베이스: restaurant-demo
echo 호스트: chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com
echo.

mysql -h chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com -P 3306 -u admin -pchopplan123 restaurant-demo < create_chat_tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo 테이블 생성 완료!
    echo ============================================
) else (
    echo.
    echo ============================================
    echo 오류 발생!
    echo MySQL 클라이언트가 설치되어 있는지 확인하세요.
    echo 또는 MySQL Workbench나 다른 DB 도구를 사용하세요.
    echo ============================================
)

pause

