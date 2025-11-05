@echo off
REM Cloud SQL 인스턴스가 준비될 때까지 대기

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 인스턴스 준비 대기
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db
set MAX_WAIT=20
set WAIT_COUNT=0

echo 인스턴스가 준비될 때까지 확인 중...
echo 최대 %MAX_WAIT%분 대기
echo.

:CHECK_LOOP
set /a WAIT_COUNT+=1

echo [%WAIT_COUNT%/%MAX_WAIT%] 상태 확인 중... (%date% %time%)

REM 진행 중인 작업 확인
gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="value(status)" 2>nul | findstr /i "DONE\|ERROR" >nul
if %ERRORLEVEL% EQU 0 (
    REM 작업 완료 확인
    for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(state)" 2^>nul') do set CURRENT_STATE=%%i
) else (
    echo 진행 중인 작업이 있습니다... 계속 대기...
    timeout /t 30 /nobreak >nul
    goto :CHECK_LOOP
)

for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(state)" 2^>nul') do set CURRENT_STATE=%%i

if "%CURRENT_STATE%"=="RUNNABLE" (
    echo.
    echo ✅ 인스턴스가 준비되었습니다!
    echo    현재 상태: RUNNABLE
    echo.
    echo 이제 다음 작업이 가능합니다:
    echo   - 인스턴스 삭제
    echo   - 인스턴스 수정
    echo   - 인스턴스 중지
    echo.
    pause
    exit /b 0
)

if %WAIT_COUNT% geq %MAX_WAIT% (
    echo.
    echo ⚠️  최대 대기 시간을 초과했습니다.
    echo    인스턴스가 아직 준비되지 않았습니다.
    echo    현재 상태: %CURRENT_STATE%
    echo.
    echo 수동으로 확인하세요:
    echo    gcloud sql instances describe %INSTANCE_NAME%
    echo.
    pause
    exit /b 1
)

echo 현재 상태: %CURRENT_STATE% - 계속 대기 중...
echo 30초 후 다시 확인...
timeout /t 30 /nobreak >nul
echo.
goto :CHECK_LOOP

