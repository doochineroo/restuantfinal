@echo off
REM MySQL 설정 및 애플리케이션 시작 스크립트

chcp 65001 >nul
echo ============================================
echo    MySQL 설정 및 애플리케이션 시작
echo ============================================
echo.

set INSTANCE_NAME=chopplan-server
set ZONE=us-west1-a

REM 1. MySQL 비밀번호 설정
echo [1/3] MySQL 비밀번호 설정 중...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --tunnel-through-iap --command="sudo mysql -e 'ALTER USER \"root\"@\"localhost\" IDENTIFIED WITH mysql_native_password BY \"chopplan123\";'"

gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --tunnel-through-iap --command="sudo mysql -e 'FLUSH PRIVILEGES;'"

echo ✅ MySQL 설정 완료
echo.

REM 2. 기존 프로세스 종료
echo [2/3] 기존 프로세스 종료 중...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --tunnel-through-iap --command="pkill -f java 2>/dev/null; sleep 2"
echo ✅ 프로세스 종료 완료
echo.

REM 3. 애플리케이션 시작
echo [3/3] 애플리케이션 시작 중...
gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --tunnel-through-iap --command="cd ~/chopplan && nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &"

echo.
echo ✅ 애플리케이션 시작 완료
echo.
echo 5초 대기 후 상태 확인...
timeout /t 5 /nobreak >nul

REM 상태 확인
echo.
echo ============================================
echo    상태 확인
echo ============================================
echo.

gcloud compute ssh %INSTANCE_NAME% --zone=%ZONE% --tunnel-through-iap --command="ps aux | grep java | grep -v grep"

echo.
echo ============================================
echo    접속 정보
echo ============================================
echo.
echo 외부 IP: 136.117.53.209
echo 사이트: http://136.117.53.209:8080
echo API: http://136.117.53.209:8080/api
echo.
echo ============================================
echo    완료!
echo ============================================
echo.

pause

