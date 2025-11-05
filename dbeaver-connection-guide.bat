@echo off
REM DBeaver 연결 가이드 출력

chcp 65001 >nul
echo ============================================
echo    DBeaver 연결 정보
echo ============================================
echo.

echo 📋 연결 설정:
echo.
echo 1. DBeaver 실행
echo 2. 데이터베이스 연결 → 새로 만들기 (Ctrl+Shift+N)
echo 3. MySQL 선택
echo.
echo 📝 연결 정보 입력:
echo    Host: localhost
echo    Port: 3306
echo    Database: chopplan
echo    Username: root
echo    Password: 1234
echo.
echo ✅ 테스트 연결 클릭 후 저장
echo.
echo 📊 데이터 확인 방법:
echo    1. 왼쪽 트리: chopplan → Tables → restaurants
echo    2. 우클릭 → "데이터 읽기" 또는 더블클릭
echo    3. 또는 SQL 편집기에서 쿼리 실행
echo.
echo 💡 빠른 SQL:
echo    SELECT COUNT(*) FROM restaurants;
echo    SELECT * FROM restaurants LIMIT 10;
echo.

pause





