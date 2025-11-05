@echo off
REM MySQL 비밀번호 찾기 스크립트

setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo    MySQL 비밀번호 찾기
echo ============================================
echo.

cd /d "%~dp0"

echo 여러 비밀번호를 자동으로 시도합니다...
echo.

set PASSWORDS=chopplan123 chopplan12 chopplan password root 1234 admin chopplan1234 empty

for %%p in (%PASSWORDS%) do (
    echo [시도 중] %%p
    
    if "%%p"=="empty" (
        echo exit | mysql -u root -e "SELECT 'SUCCESS' AS Status;" 2>nul | findstr /C:"SUCCESS" >nul
    ) else (
        echo exit | mysql -u root -p%%p -e "SELECT 'SUCCESS' AS Status;" 2>nul | findstr /C:"SUCCESS" >nul
    )
    
    if !ERRORLEVEL! EQU 0 (
        echo.
        echo ============================================
        echo ✅ 비밀번호 찾음: %%p
        echo ============================================
        echo.
        
        if "%%p"=="empty" (
            echo application.properties 설정:
            echo   spring.datasource.password=
            echo.
            echo 또는 비밀번호를 설정하려면:
            echo   ALTER USER 'root'@'localhost' IDENTIFIED BY 'chopplan123';
        ) else (
            echo application.properties 설정:
            echo   spring.datasource.password=%%p
            echo.
            echo 이제 백엔드를 실행하세요: gradlew.bat bootRun
        )
        
        pause
        exit /b 0
    )
)

echo.
echo ============================================
echo ❌ 모든 비밀번호가 실패했습니다.
echo ============================================
echo.
echo 다음 중 하나를 시도하세요:
echo.
echo [방법 1] MySQL에 직접 접속해서 확인
echo    mysql -u root -p
echo    여러 비밀번호를 입력해보세요.
echo.
echo [방법 2] 비밀번호 재설정 (안전 모드)
echo    1. XAMPP: my.ini에 skip-grant-tables 추가
echo    2. MySQL 재시작
echo    3. mysql -u root 접속
echo    4. ALTER USER 'root'@'localhost' IDENTIFIED BY 'chopplan123';
echo    5. FLUSH PRIVILEGES;
echo.
echo [방법 3] 비밀번호 제거 (개발 환경)
echo    mysql -u root -p (접속 후)
echo    ALTER USER 'root'@'localhost' IDENTIFIED BY '';
echo    FLUSH PRIVILEGES;
echo.

pause





