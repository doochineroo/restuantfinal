@echo off
chcp 65001 >nul
echo ================================================
echo 🍽️  ChopRest 데모 시스템 빠른 시작
echo ================================================
echo.

echo 📝 실행 전 확인사항:
echo   - MySQL이 실행 중이어야 합니다
echo   - choprest 데이터베이스가 생성되어 있어야 합니다
echo.

echo 🚀 백엔드 서버를 실행합니다...
echo.
echo 💡 백엔드가 실행되면 새 터미널을 열어서
echo    frontend 폴더로 이동 후 'npm start'를 실행하세요
echo.
pause

echo.
echo ⚙️  빌드 중... (처음에는 시간이 걸릴 수 있습니다)
call gradlew.bat clean build

if %errorlevel% neq 0 (
    echo.
    echo ❌ 빌드 실패! 에러를 확인하세요.
    pause
    exit /b 1
)

echo.
echo ✅ 빌드 완료!
echo 🚀 서버를 시작합니다...
echo.
echo 서버 주소: http://localhost:8080
echo 프론트엔드 주소: http://localhost:3000 (npm start 실행 후)
echo 데모 로그인: http://localhost:3000/demo/login
echo.
echo 💡 서버를 종료하려면 Ctrl+C를 누르세요
echo.

call gradlew.bat bootRun


