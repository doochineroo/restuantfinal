@echo off
REM restaurants 테이블만 빠르게 가져오기 (데이터만, 구조는 이미 있다고 가정)

chcp 65001 >nul
echo ============================================
echo    restaurants 테이블 데이터 가져오기
echo ============================================
echo.

cd /d "%~dp0"

set LOCAL_DB_USER=root
set LOCAL_DB_PWD=1234
set LOCAL_DB_NAME=chopplan

REM Cloud SQL 정보
for /f "tokens=*" %%i in ('gcloud sql instances describe chopplan-db --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set CLOUD_IP=%%i

if "%CLOUD_IP%"=="" (
    echo ❌ Cloud SQL IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo 로컬 데이터 확인...
mysql -u %LOCAL_DB_USER% -p%LOCAL_DB_PWD% %LOCAL_DB_NAME% -e "SELECT COUNT(*) as total FROM restaurants;" 2>nul

echo.
echo Cloud SQL 비밀번호 입력:
set /p CLOUD_PWD="비밀번호: "

echo.
echo restaurants 데이터 가져오기 중...
echo.

setlocal enabledelayedexpansion

REM 데이터만 추출 (INSERT 문만)
mysqldump -u %LOCAL_DB_USER% -p%LOCAL_DB_PWD% %LOCAL_DB_NAME% restaurants --no-create-info --single-transaction --skip-triggers > restaurants_data.sql 2>nul

REM Cloud SQL로 가져오기
mysql -h %CLOUD_IP% -u root -p%CLOUD_PWD% chopplan < restaurants_data.sql 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ 완료!
    echo.
    echo Cloud SQL 데이터 확인:
    mysql -h %CLOUD_IP% -u root -p%CLOUD_PWD% chopplan -e "SELECT COUNT(*) as total FROM restaurants;" 2>nul
) else (
    echo ❌ 실패
    echo DBeaver로 restaurants_data.sql 파일을 실행하세요.
)

echo.
pause

