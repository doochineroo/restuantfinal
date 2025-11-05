@echo off
REM Google Cloud SQL 인스턴스 생성 및 설정 (CLI)
REM C:\yonsai\chopplan\choprest 에서 실행

chcp 65001 >nul
echo ============================================
echo     ☁️  Cloud SQL CLI 설정 시작
echo ============================================
echo.

REM gcloud CLI 확인
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ gcloud CLI가 설치되지 않았습니다.
    echo.
    echo 📥 설치 방법:
    echo    1. https://cloud.google.com/sdk/docs/install 접속
    echo    2. Windows용 설치 프로그램 다운로드
    echo    3. 설치 후 다시 실행하세요
    echo.
    pause
    exit /b 1
)
echo ✅ gcloud CLI 확인됨

REM 로그인 확인
echo.
echo 🔐 Google Cloud 인증 확인 중...
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  로그인되지 않았습니다. 로그인을 진행합니다...
    gcloud auth login
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 로그인 실패
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('gcloud auth list --filter=status:ACTIVE --format="value(account)"') do set CURRENT_ACCOUNT=%%i
echo ✅ 로그인됨: %CURRENT_ACCOUNT%

REM 프로젝트 확인
echo.
echo 📋 현재 프로젝트 확인 중...
gcloud config get-value project >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  프로젝트가 설정되지 않았습니다.
    echo.
    echo 사용 가능한 프로젝트 목록:
    gcloud projects list --format="table(projectId,name)"
    echo.
    set /p PROJECT_ID="프로젝트 ID를 입력하세요: "
    gcloud config set project %PROJECT_ID%
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 프로젝트 설정 실패
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
echo ✅ 현재 프로젝트: %PROJECT_ID%

REM Cloud SQL Admin API 활성화
echo.
echo 🔧 Cloud SQL Admin API 활성화 중...
gcloud services enable sqladmin.googleapis.com --quiet
if %ERRORLEVEL% EQU 0 (
    echo ✅ Cloud SQL Admin API 활성화 완료
) else (
    echo ⚠️  Cloud SQL Admin API 활성화 실패 (이미 활성화되었을 수 있음)
)

REM 인스턴스 이름 설정
set INSTANCE_NAME=chopplan-db
set DATABASE_NAME=chopplan
set REGION=asia-northeast2
set ZONE=asia-northeast2-a

echo.
echo ============================================
echo     📝 Cloud SQL 인스턴스 설정
echo ============================================
echo.
echo 인스턴스 이름: %INSTANCE_NAME%
echo 데이터베이스 이름: %DATABASE_NAME%
echo 리전: %REGION%
echo.
echo 머신 유형: db-f1-micro (가장 저렴)
echo 스토리지: 10GB
echo.
set /p CREATE_INSTANCE="Cloud SQL 인스턴스를 생성하시겠습니까? (Y/N): "
if /i not "%CREATE_INSTANCE%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

REM 기존 인스턴스 확인
echo.
echo 🔍 기존 인스턴스 확인 중...
gcloud sql instances describe %INSTANCE_NAME% --format="value(name)" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ 인스턴스가 이미 존재합니다: %INSTANCE_NAME%
    echo.
    set /p RECREATE="기존 인스턴스를 삭제하고 새로 생성하시겠습니까? (Y/N): "
    if /i "%RECREATE%"=="Y" (
        echo ⚠️  인스턴스 삭제 중... (주의: 데이터가 삭제됩니다!)
        gcloud sql instances delete %INSTANCE_NAME% --quiet
        if %ERRORLEVEL% NEQ 0 (
            echo ❌ 인스턴스 삭제 실패
            pause
            exit /b 1
        )
        echo ✅ 인스턴스 삭제 완료
        timeout /t 5 /nobreak >nul
    ) else (
        echo 기존 인스턴스를 사용합니다.
        goto :CONFIGURE_EXISTING
    )
)

REM 비밀번호 입력
echo.
echo 🔐 root 비밀번호를 설정하세요:
set /p DB_PASSWORD="비밀번호: "
if "%DB_PASSWORD%"=="" (
    echo ❌ 비밀번호를 입력해야 합니다.
    pause
    exit /b 1
)

REM Cloud SQL 인스턴스 생성
echo.
echo 📦 Cloud SQL 인스턴스 생성 중... (2-3분 소요)
echo.
echo 명령어 실행 중: gcloud sql instances create %INSTANCE_NAME%
echo.

REM 변수 확인
if "%INSTANCE_NAME%"=="" (
    echo ❌ 오류: INSTANCE_NAME이 설정되지 않았습니다.
    pause
    exit /b 1
)

if "%DB_PASSWORD%"=="" (
    echo ❌ 오류: DB_PASSWORD가 설정되지 않았습니다.
    pause
    exit /b 1
)

gcloud sql instances create %INSTANCE_NAME% --database-version=MYSQL_8_0 --tier=db-f1-micro --region=%REGION% --storage-type=SSD --storage-size=10GB --storage-auto-increase --backup-start-time=03:00 --enable-bin-log --maintenance-window-day=SUN --maintenance-window-hour=04 --root-password=%DB_PASSWORD% --quiet

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 인스턴스 생성 실패
    echo.
    echo 디버깅 정보:
    echo   INSTANCE_NAME: %INSTANCE_NAME%
    echo   REGION: %REGION%
    echo   DB_PASSWORD: [설정됨]
    echo.
    echo 수동으로 실행해보세요:
    echo   gcloud sql instances create %INSTANCE_NAME% --database-version=MYSQL_8_0 --tier=db-f1-micro --region=%REGION% --storage-type=SSD --storage-size=10GB --root-password=[비밀번호]
    pause
    exit /b 1
)
echo ✅ 인스턴스 생성 완료!

:CONFIGURE_EXISTING
REM Public IP 확인 및 설정
echo.
echo 🌐 Public IP 설정 확인 중...
gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Public IP가 없습니다. Public IP를 추가합니다...
    gcloud sql instances patch %INSTANCE_NAME% --assign-ip
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Public IP 추가 실패
        pause
        exit /b 1
    )
    echo ✅ Public IP 추가 완료
)

REM Public IP 주소 가져오기
for /f "tokens=*" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)"') do set PUBLIC_IP=%%i
echo ✅ Public IP: %PUBLIC_IP%

REM 데이터베이스 생성
echo.
echo 🗄️  데이터베이스 생성 중...
gcloud sql databases create %DATABASE_NAME% --instance=%INSTANCE_NAME% --charset=utf8mb4 --collation=utf8mb4_unicode_ci --quiet
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  데이터베이스 생성 실패 (이미 존재할 수 있음)
) else (
    echo ✅ 데이터베이스 생성 완료: %DATABASE_NAME%
)

REM 네트워크 설정 (현재 IP 추가)
echo.
echo 🔒 네트워크 설정 중...
echo 현재 IP를 승인된 네트워크에 추가합니다...

REM 현재 IP 가져오기 (간단한 방법)
powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content" > temp_ip.txt
set /p CURRENT_IP=<temp_ip.txt
del temp_ip.txt

echo 현재 IP: %CURRENT_IP%
echo.
set /p ADD_IP="이 IP를 승인된 네트워크에 추가하시겠습니까? (Y/N): "
if /i "%ADD_IP%"=="Y" (
    gcloud sql instances patch %INSTANCE_NAME% --authorized-networks=%CURRENT_IP%/32 --quiet
    if %ERRORLEVEL% EQU 0 (
        echo ✅ IP 추가 완료: %CURRENT_IP%
    ) else (
        echo ⚠️  IP 추가 실패 (이미 추가되었을 수 있음)
    )
)

REM 설정 완료
echo.
echo ============================================
echo     ✅ 설정 완료!
echo ============================================
echo.
echo 📋 연결 정보:
echo    인스턴스 이름: %INSTANCE_NAME%
echo    Public IP: %PUBLIC_IP%
echo    데이터베이스: %DATABASE_NAME%
echo    사용자: root
echo    비밀번호: [설정한 비밀번호]
echo.
echo 📝 다음 단계:
echo    1. src/main/resources/application-cloudsql.properties 파일 수정:
echo       spring.datasource.url=jdbc:mysql://%PUBLIC_IP%:3306/%DATABASE_NAME%?...
echo       spring.datasource.password=[설정한 비밀번호]
echo.
echo    2. 백엔드 실행:
echo       quick-test-local-cloudsql.bat
echo.
echo    3. 프론트엔드 실행 (새 터미널):
echo       cd frontend
echo       npm start
echo.
echo 📚 상세 가이드: LOCAL_WITH_CLOUD_SQL_GUIDE.md
echo.
pause

