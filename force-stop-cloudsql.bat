@echo off
REM Cloud SQL 강제 종료 시도 (주의: 위험!)

chcp 65001 >nul
echo ============================================
echo    ⚠️  Cloud SQL 강제 종료 시도
echo ============================================
echo.
echo ⚠️  ⚠️  ⚠️  주의사항 ⚠️  ⚠️  ⚠️
echo.
echo 1. 인스턴스가 손상될 수 있습니다
echo 2. 데이터 손실 가능성이 있습니다
echo 3. 복구가 불가능할 수 있습니다
echo 4. 작업 취소가 실패할 수 있습니다
echo.
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

REM 진행 중인 작업 확인
echo 진행 중인 작업 확인 중...
echo.
gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="table(operationType,status,name)" 2>nul

echo.
echo ============================================
echo    방법 1: 작업 취소 시도
echo ============================================
echo.

set /p OPERATION_ID="취소할 작업 ID를 입력하세요 (Enter로 자동 감지): "

if "%OPERATION_ID%"=="" (
    echo.
    echo 최근 작업 ID 자동 감지 중...
    for /f "tokens=*" %%i in ('gcloud sql operations list --instance=%INSTANCE_NAME% --limit=1 --format="value(name)" 2^>nul') do set OPERATION_ID=%%i
    
    if "%OPERATION_ID%"=="" (
        echo ❌ 진행 중인 작업을 찾을 수 없습니다.
        echo.
        goto :DELETE_OPTION
    )
    
    echo 작업 ID: %OPERATION_ID%
)

echo.
echo ⚠️  작업 취소를 시도하시겠습니까?
echo    작업 ID: %OPERATION_ID%
echo.
set /p confirm="정말 취소하시겠습니까? (YES 입력): "

if not "%confirm%"=="YES" (
    echo 취소되었습니다.
    goto :DELETE_OPTION
)

echo.
echo 작업 취소 시도 중...
gcloud sql operations cancel %OPERATION_ID% --instance=%INSTANCE_NAME%

if %ERRORLEVEL% EQU 0 (
    echo ✅ 작업 취소 성공!
    echo    잠시 후 다시 시도하세요.
    echo.
    timeout /t 10 /nobreak >nul
    echo 상태 확인 중...
    gcloud sql instances describe %INSTANCE_NAME% --format="value(state)" 2>nul
    goto :END
) else (
    echo ❌ 작업 취소 실패
    echo    이 작업은 취소할 수 없습니다.
    echo.
)

:DELETE_OPTION
echo ============================================
echo    방법 2: 인스턴스 삭제 후 재생성
echo ============================================
echo.
echo ⚠️  주의: 인스턴스를 삭제하면 모든 데이터가 영구적으로 삭제됩니다!
echo.
echo 이 방법은:
echo   - 진행 중인 작업을 즉시 중단
echo   - 인스턴스를 완전히 삭제
echo   - 새로 인스턴스를 생성해야 함
echo   - 데이터는 백업에서 복원해야 함
echo.
set /p delete_confirm="인스턴스를 삭제하시겠습니까? (YES 입력): "

if not "%delete_confirm%"=="YES" (
    echo 취소되었습니다.
    echo.
    echo 권장: 작업 완료를 기다리는 것이 안전합니다.
    echo    check-active-operations.bat 실행
    goto :END
)

echo.
echo ⚠️  마지막 확인: 데이터 백업이 있습니까?
echo    백업이 없으면 데이터를 복구할 수 없습니다!
echo.
set /p final_confirm="정말 삭제하시겠습니까? (DELETE 입력): "

if not "%final_confirm%"=="DELETE" (
    echo 취소되었습니다.
    goto :END
)

echo.
echo 🗑️  인스턴스 삭제 중...
echo.
gcloud sql instances delete %INSTANCE_NAME% --quiet

if %ERRORLEVEL% EQU 0 (
    echo ✅ 인스턴스 삭제 완료!
    echo.
    echo 다음 단계:
    echo   1. 새 인스턴스 생성: setup-cloud-sql-cli.bat
    echo   2. 데이터 복원 (백업이 있다면)
    echo.
) else (
    echo ❌ 인스턴스 삭제 실패
    echo    작업이 진행 중이어서 삭제할 수 없을 수 있습니다.
    echo    잠시 후 다시 시도하세요.
)

:END
echo.
pause

