@echo off
echo 🧹 Cleaning and rebuilding Android app...

cd C:\Users\xee3d\Documents\Posty

echo.
echo 📱 Uninstalling app from emulator...
adb uninstall com.posty

echo.
echo 🗑️ Cleaning Android build...
cd android
call gradlew clean
cd ..

echo.
echo 🗑️ Cleaning React Native cache...
npx react-native start --reset-cache &
timeout /t 5 >nul
taskkill /F /IM node.exe /T 2>nul

echo.
echo 🏗️ Rebuilding Android app...
npx react-native run-android

echo.
echo ✅ Clean build complete!
pause
