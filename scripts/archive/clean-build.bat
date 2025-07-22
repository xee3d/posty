@echo off
echo 프로젝트 정리 중...
cd android
call gradlew clean
cd ..
echo.
echo 재빌드 중...
npx react-native run-android
pause