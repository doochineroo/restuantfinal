@echo off
REM Cloud SQL 테이블 빠른 생성

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 테이블 자동 생성
echo ============================================
echo.

echo 설정 확인:
echo   application-cloudsql.properties
echo   spring.jpa.hibernate.ddl-auto=update
echo.
echo 이 설정으로 엔티티 클래스에서 테이블이 자동 생성됩니다.
echo.

echo 백엔드를 실행하여 테이블을 생성합니다...
echo 테이블이 생성되면 로그에 표시됩니다.
echo Ctrl+C로 중지할 수 있습니다.
echo.

call gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'

pause

