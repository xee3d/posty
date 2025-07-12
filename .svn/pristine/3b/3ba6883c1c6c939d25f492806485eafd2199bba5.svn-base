@echo off
chcp 949
echo ========================================
echo Firebase Clean Installation for RN 0.74.5
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Step 1: Removing existing Firebase packages...
echo ========================================
npm uninstall @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/messaging @react-native-firebase/storage @react-native-firebase/analytics @react-native-firebase/crashlytics

echo.
echo Step 2: Clean cache...
echo ========================================
npm cache clean --force
if exist "node_modules\@react-native-firebase" rmdir /s /q "node_modules\@react-native-firebase"

echo.
echo Step 3: Installing Firebase v20.4.0 (verified compatible)...
echo ========================================
npm install @react-native-firebase/app@20.4.0 --save --save-exact
npm install @react-native-firebase/auth@20.4.0 --save --save-exact
npm install @react-native-firebase/firestore@20.4.0 --save --save-exact

echo.
echo Optional: Install additional Firebase modules? (Y/N)
set /p install_more=
if /i "%install_more%"=="Y" (
    echo Installing additional modules...
    npm install @react-native-firebase/messaging@20.4.0 --save --save-exact
    npm install @react-native-firebase/storage@20.4.0 --save --save-exact
    npm install @react-native-firebase/analytics@20.4.0 --save --save-exact
    npm install @react-native-firebase/crashlytics@20.4.0 --save --save-exact
)

echo.
echo Step 4: Verifying installation...
echo ========================================
npm list @react-native-firebase/app

echo.
echo Step 5: Android clean build...
echo ========================================
cd android
call gradlew clean
cd ..

echo.
echo ========================================
echo Firebase Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Ensure google-services.json is in android/app/
echo 2. Verify android/build.gradle has:
echo    classpath("com.google.gms:google-services:4.4.2")
echo 3. Verify android/app/build.gradle has:
echo    apply plugin: "com.google.gms.google-services"
echo 4. Run: npx react-native run-android
echo.
pause
