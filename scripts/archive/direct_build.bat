@echo off
echo ========================================
echo Direct Android Build
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Setting up environment...
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

echo.
echo [2] Creating build directories...
mkdir android\app\build\generated\res\processDebugGoogleServices 2>nul

echo.
echo [3] Building APK directly...
cd android
call gradlew clean
call gradlew assembleDebug --stacktrace
cd ..

echo.
echo [4] Installing APK...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo [5] Starting app...
adb shell am start -n com.posty/.MainActivity

echo.
echo Done! Make sure Metro is running in another terminal.
pause