@echo off
REM Cloud SQL 인스턴스 상태 확인 및 대기

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 인스턴스 상태 확인
echo ============================================
echo.

REM 현재 상태 확인
echo 현재 인스턴스 상태를 확인 중...
echo.

gcloud sql instances describe chopplan-db --format="table(name,settings.tier,state,settings.activationPolicy)" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 인스턴스를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    상태별 해결 방법
echo ============================================
echo.

REM 상태 확인
for /f "tokens=*" %%i in ('gcloud sql instances describe chopplan-db --format="value(state)" 2^>nul') do set INSTANCE_STATE=%%i

if "%INSTANCE_STATE%"=="RUNNABLE" (
    echo ✅ 인스턴스가 정상 실행 중입니다.
    echo    이제 삭제 또는 수정이 가능합니다.
    echo.
) else if "%INSTANCE_STATE%"=="PENDING_CREATE" (
    echo ⏳ 인스턴스 생성 중...
    echo    완료될 때까지 기다려야 합니다.
    echo.
) else if "%INSTANCE_STATE%"=="PENDING_UPDATE" (
    echo ⏳ 인스턴스 업데이트 중...
    echo    완료될 때까지 기다려야 합니다.
    echo    보통 5-10분 소요됩니다.
    echo.
) else if "%INSTANCE_STATE%"=="MAINTENANCE" (
    echo 🔧 유지보수 중...
    echo    완료될 때까지 기다려야 합니다.
    echo.
) else (
    echo 현재 상태: %INSTANCE_STATE%
    echo    완료될 때까지 기다려야 합니다.
    echo.
)

echo ============================================
echo    업데이트 진행 상황 확인
echo ============================================
echo.

echo 최근 작업 내역 확인:
gcloud sql operations list --instance=chopplan-db --limit=5 --format="table(operationType,status,startTime)" 2>nul

echo.
echo ============================================
echo    해결 방법
echo ============================================
echo.

if "%INSTANCE_STATE%"=="PENDING_UPDATE" (
    echo 방법 1: 업데이트 완료 대기 (권장)
    echo    업데이트가 완료되면 자동으로 RUNNABLE 상태가 됩니다.
    echo    보통 5-10분 소요됩니다.
    echo.
    echo 방법 2: 상태 확인 반복
    echo    이 스크립트를 주기적으로 실행하여 상태 확인:
    echo    check-cloudsql-status.bat
    echo.
    echo 방법 3: 강제 취소 (권장하지 않음)
    echo    인스턴스가 손상될 수 있습니다.
    echo.
) else (
    echo 현재 상태: %INSTANCE_STATE%
    echo    완료될 때까지 기다려야 합니다.
    echo.
)

echo ============================================
echo    자동 상태 확인 (30초마다)
echo ============================================
echo.
set /p auto_check="자동으로 상태를 확인하시겠습니까? (Y/N): "

if /i "%auto_check%"=="Y" (
    echo.
    echo 30초마다 상태를 확인합니다... (Ctrl+C로 중지)
    echo.
    :CHECK_LOOP
    timeout /t 30 /nobreak >nul
    echo [%date% %time%] 상태 확인 중...
    gcloud sql instances describe chopplan-db --format="value(state)" 2>nul
    for /f "tokens=*" %%i in ('gcloud sql instances describe chopplan-db --format="value(state)" 2^>nul') do set CURRENT_STATE=%%i
    if "%CURRENT_STATE%"=="RUNNABLE" (
        echo ✅ 인스턴스가 준비되었습니다!
        echo    이제 삭제 또는 수정이 가능합니다.
        goto :END
    )
    echo 현재 상태: %CURRENT_STATE% - 계속 대기 중...
    goto :CHECK_LOOP
    :END
)

echo.
pause

