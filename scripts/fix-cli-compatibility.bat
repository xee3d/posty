@echo off
echo ========================================
echo     Fix React Native CLI Compatibility
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/5] Removing incompatible CLI versions...
call npm uninstall @react-native-community/cli @react-native-community/cli-platform-android
echo.

echo [2/5] Installing compatible CLI versions for RN 0.72.x...
call npm install --save-dev @react-native-community/cli@^11.3.0 @react-native-community/cli-platform-android@^11.3.0
echo.

echo [3/5] Verifying installation...
call npm list @react-native-community/cli
echo.

echo [4/5] Cleaning Android cache...
cd android
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build
cd ..
echo.

echo [5/5] Testing the fix...
if exist node_modules\@react-native-community\cli-platform-android\native_modules.gradle (
    echo SUCCESS: CLI installed correctly!
) else (
    echo ERROR: Still having issues
)
echo.

echo ========================================
echo     Fix Complete!
echo ========================================
echo.
echo Now try: npx react-native run-android
echo.
pause