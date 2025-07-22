@echo off
echo === Detailed Android Build Debugging ===
echo =====================================
echo.

echo [1/5] Checking environment variables...
echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%
echo Checking platform-tools in PATH...
echo %PATH% | findstr /i "platform-tools" > nul
if %errorlevel% == 0 (
    echo OK: platform-tools is in PATH.
) else (
    echo ERROR: platform-tools not in PATH!
)
echo.

echo [2/5] Checking Java version...
java -version 2>&1
echo.
javac -version 2>&1
echo.

echo [3/5] Checking connected devices...
adb devices
echo.

echo [4/5] Running React Native Doctor...
call npx react-native doctor
echo.

echo [5/5] Starting detailed Gradle build (log saved to build-debug-log.txt)...
cd android
call gradlew.bat app:installDebug --info --debug --stacktrace > ../build-debug-log.txt 2>&1
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo Build failed! 
    echo Extracting error messages...
    echo =====================================
    findstr /i "error:" build-debug-log.txt
    findstr /i "failed" build-debug-log.txt
    findstr /i "exception" build-debug-log.txt
    echo =====================================
    echo.
    echo Check build-debug-log.txt for full log.
) else (
    echo Build successful!
)

pause