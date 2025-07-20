@echo off
echo Installing APK directly to connected device...
echo.

cd C:\Users\xee3d\Documents\Posty

:: APK 파일 경로
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk

:: 연결된 디바이스 확인
echo Checking for connected devices...
adb devices
echo.

:: APK 존재 확인
if not exist "%APK_PATH%" (
    echo APK not found at %APK_PATH%
    echo Please build the app first using build-to-phone.bat
    pause
    exit /b 1
)

:: 이전 버전 제거
echo Uninstalling previous version...
adb uninstall com.posty 2>nul

:: APK 설치
echo Installing APK...
adb install -r "%APK_PATH%"

:: 앱 실행
echo Starting app...
adb shell am start -n com.posty/.MainActivity

echo.
echo Installation complete!
echo.
pause
