@echo off
REM Cloud SQL 인스턴스 티어 확인

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 인스턴스 티어 확인
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

echo 인스턴스 정보 확인 중...
echo.

gcloud sql instances describe %INSTANCE_NAME% --format="table(name,settings.tier,region,state,databaseVersion)" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 인스턴스를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    티어 상세 정보
echo ============================================
echo.

REM 티어 확인
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(settings.tier)" 2^>nul') do set CURRENT_TIER=%%i

if "%CURRENT_TIER%"=="db-f1-micro" (
    echo ✅ 현재 티어: db-f1-micro (저렴함)
    echo    월 비용: 약 13,000-20,000원
    echo    ✅ 비용 절감 완료!
) else if "%CURRENT_TIER%"=="db-n1-standard-1" (
    echo ⚠️  현재 티어: db-n1-standard-1 (비쌈)
    echo    월 비용: 약 65,000-90,000원
    echo    💡 db-f1-micro로 변경 권장
) else (
    echo 현재 티어: %CURRENT_TIER%
    echo    비용 확인 필요
)

echo.
echo ============================================
echo    비용 비교
echo ============================================
echo.

echo 티어별 월 비용:
echo   db-f1-micro: 약 13,000-20,000원 (권장)
echo   db-n1-standard-1: 약 65,000-90,000원
echo.

echo ============================================
echo    빠른 확인 명령어
echo ============================================
echo.
echo 티어만 확인:
echo    gcloud sql instances describe chopplan-db --format="value(settings.tier)"
echo.
echo 전체 정보:
echo    gcloud sql instances describe chopplan-db
echo.

pause

