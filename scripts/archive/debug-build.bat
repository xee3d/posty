@echo off
echo 자세한 빌드 로그 생성 중...
echo.

cd android
call gradlew app:installDebug --info --stacktrace > ../build-log.txt 2>&1
cd ..

echo.
echo 빌드 로그가 build-log.txt 파일에 저장되었습니다.
echo 에러를 확인하려면 파일을 열어보세요.
pause