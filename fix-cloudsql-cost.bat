@echo off
REM Cloud SQL 비용 절감 스크립트
REM db-n1-standard-1을 db-f1-micro로 변경하거나 중지

chcp 65001 >nul
echo ============================================
echo    Cloud SQL 비용 절감
echo ============================================
echo.

REM 현재 상태 확인
echo 현재 Cloud SQL 인스턴스 상태:
gcloud sql instances describe chopplan-db --format="value(tier,region)" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 인스턴스를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo.
echo ⚠️  현재 인스턴스: db-n1-standard-1 (매우 비쌈!)
echo    월 비용: 약 $50-70 (약 65,000-90,000원)
echo.
echo 💡 권장: db-f1-micro로 변경
echo    월 비용: 약 $10-15 (약 13,000-20,000원)
echo    비용 절감: 약 80%%!
echo.

echo 옵션을 선택하세요:
echo.
echo [1] db-f1-micro로 다운그레이드 (권장, 비용 절감)
echo [2] 인스턴스 중지 (비용 중지, 나중에 다시 시작 가능)
echo [3] 인스턴스 삭제 (데이터 삭제, 주의!)
echo [4] 취소
echo.
set /p choice="선택 (1-4): "

if "%choice%"=="1" (
    echo.
    echo ⚠️  주의: 다운그레이드 시 다운타임이 발생할 수 있습니다.
    echo    백업을 권장합니다.
    echo.
    set /p confirm="계속하시겠습니까? (Y/N): "
    if /i not "%confirm%"=="Y" (
        echo 취소되었습니다.
        pause
        exit /b 0
    )
    
    echo.
    echo 🔄 db-f1-micro로 변경 중... (몇 분 소요)
    echo.
    gcloud sql instances patch chopplan-db --tier=db-f1-micro
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 다운그레이드 완료!
        echo    이제 월 비용이 약 13,000-20,000원으로 줄어듭니다.
    ) else (
        echo ❌ 다운그레이드 실패
        echo    수동으로 실행하세요:
        echo    gcloud sql instances patch chopplan-db --tier=db-f1-micro
    )
    
) else if "%choice%"=="2" (
    echo.
    echo 🔄 인스턴스 중지 중...
    echo.
    gcloud sql instances patch chopplan-db --activation-policy=NEVER
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 인스턴스 중지 완료!
        echo    이제 비용이 발생하지 않습니다.
        echo.
        echo 💡 다시 시작하려면:
        echo    gcloud sql instances patch chopplan-db --activation-policy=ALWAYS
    ) else (
        echo ❌ 중지 실패
    )
    
) else if "%choice%"=="3" (
    echo.
    echo ⚠️  ⚠️  ⚠️  주의! ⚠️  ⚠️  ⚠️
    echo    인스턴스를 삭제하면 모든 데이터가 영구적으로 삭제됩니다!
    echo    백업을 먼저 받으세요!
    echo.
    set /p confirm="정말 삭제하시겠습니까? (YES 입력): "
    if not "%confirm%"=="YES" (
        echo 취소되었습니다.
        pause
        exit /b 0
    )
    
    echo.
    echo 🗑️  인스턴스 삭제 중...
    echo.
    gcloud sql instances delete chopplan-db
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 인스턴스 삭제 완료!
    ) else (
        echo ❌ 삭제 실패
    )
    
) else (
    echo 취소되었습니다.
)

echo.
pause

