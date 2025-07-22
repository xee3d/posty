@echo off
echo === Android Build Problem Solver ===
echo.

echo [1/7] Checking google-services.json...
if exist "android\app\google-services.json" (
    echo OK: google-services.json exists.
) else (
    echo ERROR: google-services.json not found!
    echo Please download from Firebase Console and put in android/app/
)
echo.

echo [2/7] Stopping Gradle daemon...
cd android
call gradlew --stop
cd ..
echo.

echo [3/7] Cleaning temp files and cache...
if exist "%USERPROFILE%\.gradle\caches" (
    echo Cleaning Gradle cache...
    rd /s /q "%USERPROFILE%\.gradle\caches\build-cache-*" 2>nul
)
if exist "android\.gradle" rd /s /q "android\.gradle"
if exist "android\app\build" rd /s /q "android\app\build"
echo.

echo [4/7] Accepting Android licenses...
echo y | "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" --licenses 2>nul
echo.

echo [5/7] Checking SDK Build Tools...
"%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;34.0.0" "platforms;android-34"
echo.

echo [6/7] Refreshing project dependencies...
cd android
call gradlew clean
call gradlew dependencies --refresh-dependencies
cd ..
echo.

echo [7/7] Retrying build...
call npx react-native run-android

if %errorlevel% neq 0 (
    echo.
    echo ======================================
    echo If build still fails:
    echo 1. Open Android Studio and sync Gradle
    echo 2. Check JDK version (JDK 17 recommended)
    echo 3. Check environment variables:
    echo    - JAVA_HOME points to JDK path
    echo    - ANDROID_HOME points to Android SDK
    echo 4. Run debug-android-build.bat for details
    echo ======================================
)

pause