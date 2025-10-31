@echo off
chcp 65001 >nul
echo ============================================
echo MySQL에 수동으로 연결하기
echo ============================================
echo.
echo 다음 명령어를 실행하면 MySQL에 연결됩니다:
echo.
echo mysql -h chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com -P 3306 -u admin -p restaurant-demo
echo.
echo 비밀번호를 입력하라는 프롬프트가 나오면: chopplan123 입력
echo.
echo 연결 후 다음 명령어로 SQL 파일을 실행하세요:
echo.
echo   source create_chat_tables.sql;
echo.
echo 또는 아래 명령어를 직접 복사해서 실행하세요:
echo.
echo ============================================
type create_chat_tables.sql
echo ============================================
echo.
echo 위 SQL 명령어들을 복사하여 MySQL Workbench나 mysql 클라이언트에서 실행하세요.
echo.
pause



