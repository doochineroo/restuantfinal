@echo off
REM VM에서 MySQL 비밀번호 설정 수정

chcp 65001 >nul
echo MySQL 비밀번호 설정 중...

gcloud compute ssh chopplan-server --zone=us-west1-a --tunnel-through-iap --command="sudo mysql -e 'ALTER USER \"root\"@\"localhost\" IDENTIFIED WITH mysql_native_password BY \"chopplan123\";'"

gcloud compute ssh chopplan-server --zone=us-west1-a --tunnel-through-iap --command="sudo mysql -e 'FLUSH PRIVILEGES;'"

echo.
echo MySQL 비밀번호 설정 완료!
echo.

pause

