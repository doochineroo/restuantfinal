# restuantfinal
1. 로컬 CMD:
REM 빌드
gradlew.bat clean build

REM EC2로 파일 전송
scp -i chopplan.pem build\libs\choprest-0.0.1-SNAPSHOT.jar ubuntu@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:~/

REM EC2 접속
ssh -i chopplan.pem ubuntu@ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com
2. EC2에서:
pkill -f java
nohup java -jar choprest-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
tail -f app.log
3. 프론트엔드 (로컬):
cd frontend
npm run build
cd ..
aws s3 sync frontend\build/ s3://chopplandemo-app --delete
aws cloudfront create-invalidation --distribution-id E285T5MAAKCZRR --paths "/*"
