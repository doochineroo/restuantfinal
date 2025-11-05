@echo off
REM MySQL 비밀번호 재설정 또는 확인 스크립트

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    MySQL 비밀번호 재설정/확인
echo ============================================
echo.

cd /d "%~dp0"

echo 옵션을 선택하세요:
echo.
echo [1] 비밀번호 제거 (개발 환경, 가장 간단)
echo [2] 비밀번호를 'chopplan123'으로 설정
echo [3] 현재 비밀번호 확인 시도
echo.
set /p "choice=> "

if "%choice%"=="1" (
    echo.
    echo MySQL에 접속해서 비밀번호를 제거하세요:
    echo.
    echo 1. mysql -u root -p
    echo    (비밀번호 입력 시도: chopplan123, chopplan12, password, root 등)
    echo.
    echo 2. 접속 성공 후:
    echo    ALTER USER 'root'@'localhost' IDENTIFIED BY '';
    echo    FLUSH PRIVILEGES;
    echo    EXIT;
    echo.
    echo 3. application.properties에서 비밀번호를 비워두세요:
    echo    spring.datasource.password=
    echo.
    pause
    exit /b 0
)

if "%choice%"=="2" (
    echo.
    echo MySQL에 접속하세요 (현재 비밀번호 필요):
    echo   mysql -u root -p
    echo.
    echo 접속 후 다음 SQL 실행:
    echo   ALTER USER 'root'@'localhost' IDENTIFIED BY 'chopplan123';
    echo   FLUSH PRIVILEGES;
    echo   EXIT;
    echo.
    echo 그 후 application.properties 확인:
    echo   spring.datasource.password=chopplan123
    echo.
    pause
    exit /b 0
)

if "%choice%"=="3" (
    echo.
    echo 비밀번호 확인 시도 중...
    echo.
    set PASSWORDS=chopplan123 chopplan12 password root 1234 admin chopplan1234 empty
    
    for %%p in (%PASSWORDS%) do (
        echo [시도] %%p
        if "%%p"=="empty" (
            echo exit | mysql -u root -e "SELECT 'SUCCESS' AS Status;" 2>nul | findstr /C:"SUCCESS" >nul
        ) else (
            echo exit | mysql -u root -p%%p -e "SELECT 'SUCCESS' AS Status;" 2>nul | findstr /C:"SUCCESS" >nul
        )
        if !ERRORLEVEL! EQU 0 (
            echo.
            echo ✅ 성공! 비밀번호: %%p
            echo.
            if "%%p"=="empty" (
                echo application.properties 설정:
                echo   spring.datasource.password=
            ) else (
                echo application.properties 설정:
                echo   spring.datasource.password=%%p
            )
            pause
            exit /b 0
        )
    )
    
    echo.
    echo ❌ 모든 비밀번호가 실패했습니다.
    echo.
    echo MySQL에 직접 접속하세요:
    echo   mysql -u root -p
    echo.
    echo 여러 비밀번호를 시도하거나, 비밀번호를 재설정하세요.
)

pause





