@echo off
REM Cloud SQL 테이블 자동 생성 스크립트

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 테이블 자동 생성
echo ============================================
echo.

echo 이 스크립트는 Spring Boot를 실행하여 엔티티 클래스에서
echo 자동으로 테이블을 생성합니다.
echo.
echo 설정: application-cloudsql.properties
echo   spring.jpa.hibernate.ddl-auto=update
echo.
echo 이 설정으로 모든 @Entity 클래스의 테이블이 자동 생성됩니다.
echo.

set /p confirm="테이블을 생성하시겠습니까? (Y/N): "

if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo ============================================
echo    백엔드 빌드 및 실행
echo ============================================
echo.

echo [1/3] 백엔드 빌드 중...
call gradlew.bat clean build -q

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 빌드 실패
    pause
    exit /b 1
)

echo ✅ 빌드 완료
echo.

echo [2/3] 테이블 생성 중...
echo.
echo Spring Boot가 실행되면서 엔티티 클래스에서 테이블을 자동 생성합니다.
echo.
echo 생성될 테이블:
echo   - restaurants (식당)
echo   - demo_users (사용자)
echo   - demo_reservations (예약)
echo   - demo_blacklist (블랙리스트)
echo   - EVENTS (이벤트)
echo   - menus (메뉴)
echo   - notifications (알림)
echo   - search_keywords (검색 키워드)
echo   - user_favorites (즐겨찾기)
echo   - 기타 테이블들...
echo.
echo [3/3] 백엔드 실행 중...
echo.
echo 테이블이 생성되면 로그에 표시됩니다.
echo Ctrl+C로 중지할 수 있습니다.
echo.

call gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'

pause

