@echo off
REM 데이터베이스에 데이터가 있는지 확인

chcp 65001 >nul
echo ============================================
echo    데이터베이스 데이터 확인
echo ============================================
echo.

echo [1단계] 총 식당 수 확인...
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) as total_restaurants FROM restaurants;"
echo.

echo [2단계] 좌표 통계 확인...
mysql -u root -p1234 chopplan -e "SELECT COUNT(*) as total, COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as with_coords, COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as without_coords FROM restaurants;"
echo.

echo [3단계] 맥도날드 검색 테스트...
mysql -u root -p1234 chopplan -e "SELECT id, restaurant_name, branch_name, lat, lng FROM restaurants WHERE restaurant_name LIKE '%맥도날드%' LIMIT 5;"
echo.

echo [4단계] 샘플 데이터 확인 (첫 5개)...
mysql -u root -p1234 chopplan -e "SELECT id, restaurant_name, lat, lng FROM restaurants LIMIT 5;"
echo.

echo ✅ 확인 완료!
echo.
pause





