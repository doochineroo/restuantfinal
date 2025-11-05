@echo off
REM 로컬 테스트용 스크립트 (C:\yonsai\chopplan\choprest 에서 실행)

chcp 65001 >nul
echo ============================================
echo     🧪 로컬 테스트 시작
echo ============================================
echo.

REM 현재 위치 확인
if not exist build.gradle (
    echo ❌ 오류: C:\yonsai\chopplan\choprest 위치에서 실행해야 합니다.
    pause
    exit /b 1
)

echo 📋 사전 확인:
echo   1. MySQL이 실행 중인지 확인
echo   2. 데이터베이스 'chopplan'이 생성되어 있는지 확인
echo   3. 백엔드와 프론트엔드를 각각 다른 터미널에서 실행합니다
echo.
echo 💡 데이터베이스가 없으면 먼저 생성하세요:
echo    mysql -u root -p
echo    CREATE DATABASE chopplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
pause

echo.
echo ============================================
echo     📦 백엔드 빌드 및 실행
echo ============================================
echo.

echo ⚙️  백엔드 빌드 중...
call gradlew.bat clean build -q
if %errorlevel% neq 0 (
    echo ❌ 백엔드 빌드 실패
    pause
    exit /b 1
)
echo ✅ 백엔드 빌드 완료
echo.

echo 📝 다음 단계:
echo   1. 이 터미널에서 백엔드가 실행됩니다 (포트 8080)
echo   2. 새 터미널을 열어서 프론트엔드를 실행하세요:
echo      cd frontend
echo      npm start
echo   3. 또는 frontend\START_FRONTEND.bat 파일을 실행하세요
echo.
echo 🌐 접속 주소:
echo    백엔드 API: http://localhost:8080/api
echo    프론트엔드: http://localhost:3000 (프론트엔드 실행 후)
echo.
echo 💡 종료하려면 Ctrl+C를 누르세요
echo.
echo ============================================
echo     🚀 백엔드 서버 시작
echo ============================================
echo.

call gradlew.bat bootRun

