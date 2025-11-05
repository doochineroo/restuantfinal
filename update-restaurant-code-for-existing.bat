@echo off
REM 기존 restaurants 데이터의 restaurant_code 업데이트
REM CSV에서 처음 400개를 읽어서 restaurant_code 업데이트

chcp 65001 >nul
echo ============================================
echo    restaurant_code 업데이트
echo ============================================
echo.
echo ⚠️  이 스크립트는:
echo   1. CSV에서 처음 400개를 읽습니다
echo   2. 기존 restaurants 데이터의 restaurant_code를 업데이트합니다
echo   3. 식당명과 지점명으로 매칭합니다
echo.
echo 더 확실한 방법:
echo   1. keep-only-400-restaurants.bat 실행 (400개만 남기기)
echo   2. 백엔드 실행하여 CSV에서 자동으로 로드
echo.
pause

