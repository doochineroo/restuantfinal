@echo off
REM restaurants 테이블 비우기 (CSV 다시 로드용)

chcp 65001 >nul
echo ============================================
echo    restaurants 테이블 비우기
echo ============================================
echo.
echo ⚠️  주의: 이 작업은 restaurants 테이블의 모든 데이터를 삭제합니다!
echo    CSV를 다시 로드하려면 이 작업이 필요합니다.
echo.
cd /d "%~dp0"

REM Cloud SQL 설정
set INSTANCE_NAME=chopplan-db
set DB_NAME=chopplan

echo [1/2] Cloud SQL Public IP 확인 중...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set CLOUD_SQL_IP=%%i

if "%CLOUD_SQL_IP%"=="" (
    echo ❌ Cloud SQL Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ Cloud SQL IP: %CLOUD_SQL_IP%
echo.

echo [2/2] Cloud SQL 비밀번호 입력...
set /p CLOUD_DB_PASSWORD="Cloud SQL root 비밀번호: "

if "%CLOUD_DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo 현재 데이터 개수 확인...
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as total FROM restaurants;" 2>nul

echo.
echo ⚠️  정말로 모든 데이터를 삭제하시겠습니까?
set /p confirm="삭제 (Y/N): "

if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 데이터 삭제 중...
mysql -h %CLOUD_SQL_IP% -u root -p%CLOUD_DB_PASSWORD% %DB_NAME% -e "DELETE FROM restaurants;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 데이터 삭제 완료!
    echo.
    echo 다음 단계:
    echo   1. 백엔드를 실행하세요 (quick-create-tables.bat)
    echo   2. 백엔드가 시작되면 CSV가 자동으로 로드됩니다
    echo   3. restaurant_code가 자동으로 채워집니다
) else (
    echo.
    echo ❌ 데이터 삭제 실패
)

echo.
pause

