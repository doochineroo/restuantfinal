@echo off
REM 로컬 MySQL 비밀번호 빠른 수정 (AWS RDS와 무관)

chcp 65001 >nul
echo ============================================
echo    로컬 MySQL 비밀번호 수정
echo ============================================
echo.
echo 참고: AWS RDS와는 무관합니다.
echo 현재 설정: localhost:3306 (로컬 MySQL)
echo.

echo MySQL 비밀번호를 입력하세요 (없으면 그냥 Enter):
set /p "mysql_pwd=> "

if "!mysql_pwd!"=="" (
    echo.
    echo ⚠️  비밀번호를 입력하지 않았습니다.
    echo    MySQL root 비밀번호를 제거하시겠습니까? (Y/N)
    set /p "remove_pwd=> "
    
    if /i "!remove_pwd!"=="Y" (
        echo.
        echo MySQL 접속 후 다음 명령어 실행:
        echo   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
        echo   FLUSH PRIVILEGES;
        echo   EXIT;
        echo.
        echo 실행할까요? (Y/N)
        set /p "confirm=> "
        
        if /i "!confirm!"=="Y" (
            echo.
            echo MySQL 접속 중... (비밀번호 필요)
            mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED BY ''; FLUSH PRIVILEGES;" 2>nul
            
            if !ERRORLEVEL! EQU 0 (
                echo ✅ 비밀번호 제거 완료!
                echo    application.properties는 그대로 두세요.
            ) else (
                echo ❌ 실패! MySQL 접속 후 수동 실행하세요.
            )
        )
    )
) else (
    echo.
    echo application.properties 수정 중...
    
    powershell -Command "(Get-Content 'src\main\resources\application.properties') -replace 'spring\.datasource\.password=$', 'spring.datasource.password=!mysql_pwd!' | Set-Content 'src\main\resources\application.properties'"
    
    echo ✅ 완료!
    echo.
    echo 설정된 비밀번호: !mysql_pwd!
    echo.
    echo 이제 백엔드를 실행하세요: gradlew.bat bootRun
)

pause





