@echo off
chcp 65001 >nul
echo ================================================
echo ⚛️  ChopRest 프론트엔드 시작
echo ================================================
echo.

echo 📝 실행 전 확인사항:
echo   - 백엔드 서버가 실행 중이어야 합니다 (localhost:8080)
echo   - Node.js가 설치되어 있어야 합니다
echo.

echo 🔍 node_modules 확인 중...
if not exist "node_modules\" (
    echo.
    echo 📦 패키지를 설치합니다... (처음에는 시간이 걸립니다)
    call npm install
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 패키지 설치 실패! 에러를 확인하세요.
        pause
        exit /b 1
    )
) else (
    echo ✅ 패키지가 이미 설치되어 있습니다.
)

echo.
echo 🚀 개발 서버를 시작합니다...
echo.
echo 프론트엔드 주소: http://localhost:3000
echo 데모 로그인: http://localhost:3000/demo/login
echo.
echo 테스트 계정:
echo   - 관리자: admin / admin123
echo   - 가게주인: owner / owner123
echo   - 일반회원: user / user123
echo.
echo 💡 서버를 종료하려면 Ctrl+C를 누르세요
echo.

call npm start


