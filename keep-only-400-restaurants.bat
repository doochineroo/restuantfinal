@echo off
REM restaurants 데이터 400개만 남기고 나머지 삭제
REM restaurant_code 추가/업데이트

chcp 65001 >nul
echo ============================================
echo    restaurants 데이터 400개만 유지
echo    restaurant_code 추가/업데이트
echo ============================================
echo.
cd /d "%~dp0"

REM Cloud SQL 설정
set INSTANCE_NAME=chopplan-db
set DB_NAME=chopplan

echo [1/4] Cloud SQL Public IP 확인 중...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set CLOUD_SQL_IP=%%i

if "%CLOUD_SQL_IP%"=="" (
    echo ❌ Cloud SQL Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ Cloud SQL IP: %CLOUD_SQL_IP%
echo.

echo [2/4] Cloud SQL 비밀번호 입력...
set /p CLOUD_DB_PASSWORD="Cloud SQL root 비밀번호: "

if "%CLOUD_DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo [3/4] 현재 데이터 개수 확인...
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as total FROM restaurants;" 2>nul

echo.
echo ⚠️  id가 400보다 큰 데이터를 모두 삭제합니다.
echo    (id 기준으로 처음 400개만 유지)
set /p confirm="계속 (Y/N): "

if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [4/4] 400개 초과 데이터 삭제 중...
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "DELETE FROM restaurants WHERE id > 400;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 데이터 삭제 완료!
    echo.
    echo 남은 데이터 개수 확인...
    mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as remaining FROM restaurants;" 2>nul
    echo.
    echo 다음 단계:
    echo   1. 백엔드를 실행하여 restaurant_code 컬럼이 추가되었는지 확인
    echo   2. CSV에서 처음 400개를 로드하여 restaurant_code 업데이트
) else (
    echo.
    echo ❌ 데이터 삭제 실패
)

echo.
pause

