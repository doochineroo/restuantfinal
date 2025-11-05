@echo off
REM 포트 8080을 사용하는 프로세스 종료

chcp 65001 >nul
echo ============================================
echo    포트 8080 프로세스 종료
echo ============================================
echo.

echo 포트 8080을 사용하는 프로세스 확인 중...
echo.

REM 포트 8080을 사용하는 PID 찾기
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    set PID=%%a
    goto :found
)

echo ✅ 포트 8080을 사용하는 프로세스가 없습니다.
echo.
pause
exit /b 0

:found
echo 발견된 프로세스 ID: %PID%
echo.

REM 프로세스 정보 확인
for /f "tokens=2" %%b in ('tasklist /FI "PID eq %PID%" /FO LIST ^| findstr "Image Name"') do (
    set PROCESS_NAME=%%b
)

echo 프로세스 이름: %PROCESS_NAME%
echo.

echo ⚠️  이 프로세스를 종료하시겠습니까?
set /p confirm="종료 (Y/N): "

if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo 프로세스 종료 중...
taskkill /PID %PID% /F

if %ERRORLEVEL% EQU 0 (
    echo ✅ 프로세스 종료 완료!
    echo.
    echo 이제 백엔드를 다시 실행할 수 있습니다.
) else (
    echo ❌ 프로세스 종료 실패
    echo    관리자 권한이 필요할 수 있습니다.
)

echo.
pause

