@echo off
echo 깊은 정리 시작...
echo.

echo 1. Android 빌드 캐시 정리...
cd android
call gradlew clean
call gradlew --stop
rd /s /q .gradle
rd /s /q app\build
cd ..

echo.
echo 2. Metro 캐시 정리...
rd /s /q %TEMP%\metro-cache
rd /s /q %TEMP%\react-native-*

echo.
echo 3. Node 모듈 재설치...
echo 패키지 잠금 파일을 유지하면서 node_modules 삭제...
rd /s /q node_modules
npm install

echo.
echo 4. React Native 캐시 정리...
npx react-native start --reset-cache

echo.
echo 정리 완료! 이제 다시 빌드를 시도하세요.
echo npx react-native run-android
pause