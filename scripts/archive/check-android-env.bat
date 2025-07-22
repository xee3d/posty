@echo off
echo Android 빌드 문제 해결 중...
echo.

echo 1. Java 버전 확인...
java -version
echo.

echo 2. Android SDK 위치 확인...
echo ANDROID_HOME: %ANDROID_HOME%
echo.

echo 3. React Native Doctor 실행...
npx react-native doctor
echo.

echo 4. Android 라이센스 수락...
if exist "%ANDROID_HOME%\tools\bin\sdkmanager.bat" (
    call "%ANDROID_HOME%\tools\bin\sdkmanager.bat" --licenses
) else if exist "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" (
    call "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" --licenses
) else (
    echo SDK Manager를 찾을 수 없습니다.
)

echo.
echo 5. ADB 장치 확인...
adb devices

echo.
pause