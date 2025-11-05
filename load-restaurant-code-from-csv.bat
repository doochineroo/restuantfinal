@echo off
REM CSV의 식당 ID를 restaurant_code에 업데이트
REM 주의: 기존 데이터를 삭제하고 CSV를 다시 로드합니다

chcp 65001 >nul
echo ============================================
echo    restaurant_code 업데이트
echo ============================================
echo.
echo ⚠️  주의: 이 작업은 기존 restaurants 데이터를 삭제하고
echo    CSV 파일에서 다시 로드합니다.
echo.
echo 방법:
echo   1. 백엔드를 실행하여 CSV가 자동으로 로드되도록 합니다
echo   2. 또는 restaurants 테이블을 비운 후 백엔드를 실행합니다
echo.
echo 백엔드 실행:
echo   - quick-create-tables.bat 실행
echo   - 또는: gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'
echo.
echo 백엔드가 시작되면:
echo   - RestaurantService.initializeData()가 자동 실행됩니다
echo   - restaurants 테이블이 비어있으면 CSV를 자동으로 로드합니다
echo   - CSV의 첫 번째 컬럼(식당 ID)이 restaurant_code에 저장됩니다
echo.
echo 현재 데이터 확인:
echo   - restaurants 테이블에 데이터가 있으면 CSV가 로드되지 않습니다
echo   - CSV를 다시 로드하려면 데이터를 삭제해야 합니다
echo.
pause

