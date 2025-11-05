@echo off
REM API 테스트 스크립트 (간단 버전)

chcp 65001 >nul
echo ============================================
echo    API 테스트
echo ============================================
echo.

echo 브라우저에서 확인하세요:
echo http://localhost:8080/api/restaurants/search?keyword=맥도날드
echo.
echo 또는 PowerShell에서:
echo curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"
echo.

echo [터미널에서 결과 확인]...
echo.

curl "http://localhost:8080/api/restaurants/search?keyword=맥도날드"

echo.
echo.
echo ✅ 위에 JSON 결과가 출력되었습니다!
echo.
echo 💡 더 보기 좋게 보려면:
echo    브라우저에 주소를 복사해서 붙여넣으세요
echo.
pause





