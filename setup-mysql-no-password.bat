@echo off
REM MySQL root 비밀번호 제거 스크립트 (개발 환경용)
REM 프로덕션 환경에서는 사용하지 마세요!

chcp 65001 >nul
echo ============================================
echo    MySQL root 비밀번호 제거 (개발용)
echo ============================================
echo.
echo ⚠️  경고: 이는 개발 환경에서만 사용하세요!
echo    보안이 중요한 환경에서는 사용하지 마세요.
echo.

cd /d "%~dp0"

echo MySQL root 비밀번호를 입력하세요 (제거할 비밀번호):
set /p "CURRENT_PASSWORD=> "

echo.
echo 비밀번호를 제거하는 중...
mysql -u root -p%CURRENT_PASSWORD% -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '';" 2>nul

if %ERRORLEVEL% EQU 0 (
    mysql -u root -p%CURRENT_PASSWORD% -e "FLUSH PRIVILEGES;" 2>nul
    echo.
    echo ✅ 비밀번호 제거 완료!
    echo.
    echo 이제 application.properties에서 비밀번호를 비워두시면 됩니다:
    echo spring.datasource.password=
    echo.
    echo cleanup-restaurants-no-password.bat 스크립트를 사용할 수 있습니다.
) else (
    echo.
    echo ❌ 실패! 비밀번호가 올바른지 확인하세요.
    echo.
    echo 수동으로 실행:
    echo 1. mysql -u root -p
    echo 2. ALTER USER 'root'@'localhost' IDENTIFIED BY '';
    echo 3. FLUSH PRIVILEGES;
    echo 4. exit
)

pause





