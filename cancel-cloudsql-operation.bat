@echo off
REM Cloud SQL 진행 중인 작업 취소 시도

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 작업 취소 시도
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

echo ⚠️  주의: 작업 취소는 권장하지 않습니다.
echo    인스턴스가 손상될 수 있습니다.
echo.

REM 진행 중인 작업 확인
echo 진행 중인 작업 확인...
gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="table(operationType,status,name)" 2>nul

echo.
set /p OPERATION_ID="취소할 작업 ID를 입력하세요 (또는 Enter로 자동 감지): "

if "%OPERATION_ID%"=="" (
    echo.
    echo 최근 작업 ID 자동 감지 중...
    for /f "tokens=*" %%i in ('gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="value(name)" 2^>nul') do set OPERATION_ID=%%i
    
    if "%OPERATION_ID%"=="" (
        echo ❌ 진행 중인 작업을 찾을 수 없습니다.
        pause
        exit /b 1
    )
    
    echo 작업 ID: %OPERATION_ID%
)

echo.
echo ⚠️  이 작업을 취소하시겠습니까?
echo    작업 ID: %OPERATION_ID%
echo.
set /p confirm="정말 취소하시겠습니까? (YES 입력): "

if not "%confirm%"=="YES" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 작업 취소 시도 중...
gcloud sql operations cancel %OPERATION_ID% --instance=%INSTANCE_NAME%

if %ERRORLEVEL% EQU 0 (
    echo ✅ 작업 취소 성공!
    echo    잠시 후 다시 시도하세요.
) else (
    echo ❌ 작업 취소 실패
    echo    이 작업은 취소할 수 없습니다.
    echo    작업 완료를 기다려야 합니다.
)

echo.
pause

