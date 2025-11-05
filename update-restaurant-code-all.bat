@echo off
REM 기존 데이터를 유지하면서 restaurant_code 업데이트
REM CSV 파일을 읽어서 식당명으로 매칭하여 restaurant_code 업데이트

chcp 65001 >nul
echo ============================================
echo    restaurant_code 업데이트 (기존 데이터 유지)
echo ============================================
echo.
echo ⚠️  이 방법은 식당명으로 매칭하여 업데이트합니다.
echo    식당명이 정확히 일치해야 합니다.
echo.
echo 더 확실한 방법:
echo   1. 기존 데이터를 삭제하고 CSV를 다시 로드
echo   2. clear-and-reload-restaurants.bat 실행
echo.
pause

