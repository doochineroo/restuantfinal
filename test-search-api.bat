@echo off
REM API 테스트 스크립트 (URL 인코딩 포함)

chcp 65001 >nul
echo ============================================
echo    식당 검색 API 테스트
echo ============================================
echo.

echo [방법 1] 브라우저에서 확인 (추천):
echo    http://localhost:8080/api/restaurants/search?keyword=맥도날드
echo.
echo [방법 2] PowerShell에서:
echo    Invoke-WebRequest -Uri "http://localhost:8080/api/restaurants/search?keyword=맥도날드" | Select-Object -ExpandProperty Content
echo.
echo [방법 3] URL 인코딩 사용:
echo    curl "http://localhost:8080/api/restaurants/search?keyword=%%EB%%A7%%A5%%EB%%8F%%84%%EB%%82%%A0%%EB%%93%%9C"
echo.

echo [터미널에서 테스트]...
echo.

REM URL 인코딩된 검색어 사용
curl "http://localhost:8080/api/restaurants/search?keyword=%EB%A7%A5%EB%8F%84%EB%82%A0%EB%93%9C"

echo.
echo.
echo ✅ 위에 JSON 결과가 출력되었습니다!
echo.
echo 💡 더 보기 좋게 보려면 브라우저를 사용하세요!
echo.
pause





