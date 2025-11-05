@echo off
REM 로컬 테스트용 스크립트 (Cloud SQL 사용)
REM C:\yonsai\chopplan\choprest 에서 실행

chcp 65001 >nul
echo ============================================
echo     ☁️  로컬 + Cloud SQL 테스트 시작
echo ============================================
echo.

REM 현재 위치 확인
if not exist build.gradle (
    echo ❌ 오류: C:\yonsai\chopplan\choprest 위치에서 실행해야 합니다.
    pause
    exit /b 1
)

echo 📋 사전 확인:
echo   1. Google Cloud SQL 인스턴스가 생성되어 있는지 확인
echo   2. Public IP가 활성화되어 있는지 확인
echo   3. application-cloudsql.properties 파일이 설정되어 있는지 확인
echo   4. 백엔드와 프론트엔드를 각각 다른 터미널에서 실행합니다
echo.
echo 💡 설정 가이드: LOCAL_WITH_CLOUD_SQL_GUIDE.md 참고
echo.
pause

echo.
echo ============================================
echo     📦 백엔드 빌드 및 실행 (Cloud SQL)
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
echo   1. 이 터미널에서 백엔드가 실행됩니다 (포트 8080, Cloud SQL 사용)
echo   2. 새 터미널을 열어서 프론트엔드를 실행하세요:
echo      cd frontend
echo      npm start
echo   3. 또는 frontend\START_FRONTEND.bat 파일을 실행하세요
echo.
echo 🌐 접속 주소:
echo    백엔드 API: http://localhost:8080/api (Cloud SQL 사용)
echo    프론트엔드: http://localhost:3000 (프론트엔드 실행 후)
echo.
echo 💡 종료하려면 Ctrl+C를 누르세요
echo.
echo ============================================
echo     🚀 백엔드 서버 시작 (Cloud SQL)
echo ============================================
echo.

call gradlew.bat bootRun --args='--spring.profiles.active=cloudsql'

