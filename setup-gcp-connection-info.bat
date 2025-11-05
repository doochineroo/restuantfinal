@echo off
REM Google Cloud VM 외부 IP 설정 스크립트 (VM 내부 MySQL 사용)

chcp 65001 >nul
echo ============================================
echo    Google Cloud VM 외부 IP 설정
echo    (VM 내부 MySQL 사용 - Cloud SQL 없음)
echo ============================================
echo.

REM Compute Engine 외부 IP 입력
set /p GCE_EXTERNAL_IP="Compute Engine 외부 IP (예: 136.117.47.204): "
if "%GCE_EXTERNAL_IP%"=="" (
    echo ❌ IP 주소를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo ✅ 설정 정보:
echo    VM 외부 IP: %GCE_EXTERNAL_IP%
echo    데이터베이스: VM 내부 MySQL (localhost)
echo.

REM .env 파일 생성 (프론트엔드용)
echo 📝 프론트엔드 .env.production 파일 생성 중...

(
    echo # Google Cloud Compute Engine 배포용 환경 변수
    echo # 외부 IP: %GCE_EXTERNAL_IP%
    echo.
    echo REACT_APP_API_BASE_URL=http://%GCE_EXTERNAL_IP%:8080/api
    echo PUBLIC_URL=/
) > frontend\.env.production

if %errorlevel% neq 0 (
    echo ❌ .env.production 파일 생성 실패
    pause
    exit /b 1
)

echo ✅ .env.production 파일 생성 완료!
echo.

REM 설정 정보 저장
(
    echo GCE_EXTERNAL_IP=%GCE_EXTERNAL_IP%
    echo USE_VM_INTERNAL_MYSQL=true
) > gcp-config.env

echo ✅ 설정 정보가 gcp-config.env 파일에 저장되었습니다.
echo.
echo 📋 다음 단계:
echo    1. frontend/.env.production 파일 확인
echo    2. deploy-gcp-compute-engine.bat 실행하여 서버 배포
echo    3. 또는 GCP_COMPLETE_DEPLOYMENT_GUIDE.md 참고
echo.
echo 🌐 접속 URL:
echo    프론트엔드: http://%GCE_EXTERNAL_IP%:8080
echo    백엔드 API: http://%GCE_EXTERNAL_IP%:8080/api
echo.

pause


