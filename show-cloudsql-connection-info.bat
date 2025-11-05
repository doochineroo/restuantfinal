@echo off
REM Cloud SQL 연결 정보 표시 (DBeaver용)

chcp 65001 >nul
echo ============================================
echo    Cloud SQL DBeaver 연결 정보
echo ============================================
echo.

set INSTANCE_NAME=chopplan-db

REM Public IP 확인
echo Public IP 확인 중...
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" 2^>nul') do set PUBLIC_IP=%%i

if "%PUBLIC_IP%"=="" (
    echo ❌ Public IP를 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ Public IP: %PUBLIC_IP%
echo.

REM application-cloudsql.properties에서 비밀번호 확인 시도
echo 설정 파일에서 비밀번호 확인 중...
findstr /C:"spring.datasource.password" src\main\resources\application-cloudsql.properties >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2 delims==" %%i in ('findstr /C:"spring.datasource.password" src\main\resources\application-cloudsql.properties') do set DB_PASSWORD=%%i
    if "%DB_PASSWORD%"=="" (
        echo ⚠️  비밀번호가 설정 파일에 저장되지 않았습니다.
        echo    비밀번호를 직접 입력하세요.
    ) else (
        echo ✅ 비밀번호: %DB_PASSWORD%
    )
) else (
    echo ⚠️  설정 파일을 찾을 수 없습니다.
)

echo.
echo ============================================
echo    DBeaver 연결 정보
echo ============================================
echo.
echo 메인 탭:
echo   호스트: %PUBLIC_IP%
echo   포트: 3306
echo   데이터베이스: chopplan
echo   사용자명: root
echo   비밀번호: [설정한 비밀번호 입력]
echo.
echo ============================================
echo    연결 문자열
echo ============================================
echo.
echo JDBC URL:
echo   jdbc:mysql://%PUBLIC_IP%:3306/chopplan
echo.
echo ============================================
echo    빠른 복사
echo ============================================
echo.
echo 호스트: %PUBLIC_IP%
echo.
echo 이 IP를 DBeaver의 호스트 필드에 입력하세요!
echo.
pause

