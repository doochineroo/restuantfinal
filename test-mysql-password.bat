@echo off
REM MySQL 비밀번호 테스트 스크립트

chcp 65001 >nul
echo ============================================
echo    MySQL 비밀번호 테스트
echo ============================================
echo.

cd /d "%~dp0"

echo 여러 비밀번호를 시도합니다...
echo.

set PASSWORDS=chopplan123 chopplan12 chopplan password root 1234 admin chopplan1234

for %%p in (%PASSWORDS%) do (
    echo [시도] %%p
    echo exit | mysql -u root -p%%p -e "SELECT 'SUCCESS' AS Status;" 2>nul | findstr /C:"SUCCESS" >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✅ 성공! 비밀번호: %%p
        echo.
        echo application.properties에 설정할 비밀번호: %%p
        pause
        exit /b 0
    )
)

echo.
echo ❌ 모든 비밀번호가 실패했습니다.
echo.
echo MySQL에 직접 접속해서 비밀번호를 확인하세요:
echo    mysql -u root -p
echo.
echo 또는 비밀번호를 재설정하세요.
pause





