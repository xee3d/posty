@echo off
chcp 949
echo ========================================
echo Installing Firebase for React Native 0.74.5
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Installing required Firebase packages...
echo ========================================

echo Installing @react-native-firebase/app...
npm install @react-native-firebase/app@20.4.0 --save --save-exact

echo.
echo Installing @react-native-firebase/auth...
npm install @react-native-firebase/auth@20.4.0 --save --save-exact

echo.
echo Installing @react-native-firebase/firestore...
npm install @react-native-firebase/firestore@20.4.0 --save --save-exact

echo.
echo ========================================
echo Firebase packages installed!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure google-services.json is in android/app/
echo 2. Clean and rebuild Android:
echo    cd android
echo    gradlew clean
echo    cd ..
echo    npx react-native run-android
echo.
pause
