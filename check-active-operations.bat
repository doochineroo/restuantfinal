@echo off
REM Cloud SQL 진행 중인 작업 확인 및 대기

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 진행 중인 작업 확인
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

echo 진행 중인 작업 확인 중...
echo.

gcloud sql operations list --instance=%INSTANCE_NAME% --limit=5 --format="table(operationType,status,startTime,endTime,error)" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 작업 목록을 가져올 수 없습니다.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    진행 중인 작업 분석
echo ============================================
echo.

REM 진행 중인 작업 확인
for /f "tokens=*" %%i in ('gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="value(operationType,status)" 2^>nul') do set OPERATION_INFO=%%i

if "%OPERATION_INFO%"=="" (
    echo ✅ 진행 중인 작업이 없습니다.
    echo    이제 다른 작업을 수행할 수 있습니다.
    echo.
    pause
    exit /b 0
)

echo 현재 진행 중인 작업이 있습니다.
echo.

REM 작업 상세 확인
echo 최근 작업 상세:
gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="table(operationType,status,startTime,progress,error)" 2>nul

echo.
echo ============================================
echo    해결 방법
echo ============================================
echo.

echo 방법 1: 작업 완료 대기 (권장)
echo    작업이 완료될 때까지 기다려야 합니다.
echo    보통 5-10분 소요됩니다.
echo.
echo 방법 2: 작업 취소 시도 (가능한 경우)
echo    일부 작업은 취소할 수 있습니다.
echo.

set /p choice="작업 완료를 자동으로 기다리시겠습니까? (Y/N): "

if /i "%choice%"=="Y" (
    echo.
    echo 작업 완료를 기다리는 중... (30초마다 확인)
    echo Ctrl+C로 중지할 수 있습니다.
    echo.
    
    :WAIT_LOOP
    timeout /t 30 /nobreak >nul
    
    echo [%date% %time%] 작업 상태 확인 중...
    
    REM 진행 중인 작업 확인
    gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="value(status)" 2>nul | findstr /i "DONE\|ERROR" >nul
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 작업이 완료되었습니다!
        echo.
        echo 최종 상태:
        gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="table(operationType,status)"
        echo.
        echo 이제 다른 작업을 수행할 수 있습니다.
        goto :END
    )
    
    echo 진행 중... 계속 대기...
    goto :WAIT_LOOP
    
    :END
) else (
    echo.
    echo 수동으로 확인하세요:
    echo    gcloud sql operations list --instance=%INSTANCE_NAME%
    echo.
    echo 작업이 완료되면 (DONE 또는 ERROR 상태) 다시 시도하세요.
)

echo.
pause

