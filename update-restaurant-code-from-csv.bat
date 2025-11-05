@echo off
REM CSV 데이터를 다시 로드하여 restaurant_code 업데이트

chcp 65001 >nul
echo ============================================
echo    restaurant_code 업데이트 안내
echo ============================================
echo.
echo ⚠️  restaurant_code 컬럼은 백엔드 실행 시 자동으로 업데이트됩니다.
echo.
echo 방법:
echo   1. 백엔드를 실행하면 자동으로 테이블이 업데이트됩니다
echo   2. CSV 데이터를 다시 로드하면 restaurant_code가 채워집니다
echo.
echo 백엔드 실행:
echo   - quick-create-tables.bat 실행
echo   - 또는 백엔드를 실행하여 spring.jpa.hibernate.ddl-auto=update로 자동 업데이트
echo.
echo CSV 데이터 다시 로드:
echo   - 백엔드가 시작되면 자동으로 restaurants.csv가 로드됩니다
echo   - 또는 restaurants 테이블을 비운 후 다시 시작
echo.
pause

