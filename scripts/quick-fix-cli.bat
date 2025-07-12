@echo off
echo ========================================
echo     Quick Fix for React Native CLI
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/3] Installing missing React Native CLI packages...
call npm install --save-dev @react-native-community/cli @react-native-community/cli-platform-android
echo.

echo [2/3] Verifying installation...
call npm list @react-native-community/cli
echo.

echo [3/3] Cleaning Android cache...
cd android
if exist .gradle (
    rmdir /s /q .gradle
)
cd ..
echo.

echo ========================================
echo     Quick fix complete!
echo ========================================
echo.
echo Now try running:
echo   npx react-native run-android
echo.
pause