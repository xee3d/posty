@echo off
chcp 65001 > nul
cd C:\Users\xee3d\Documents\Posty

echo ========================================
echo Posty 완전 초기화 및 재설치
echo ========================================
echo.

echo 연결된 기기:
adb devices
echo.

echo 1. 에뮬레이터 완전 초기화
echo 2. 모바일 완전 초기화
echo 3. 모든 기기 완전 초기화
echo 0. 취소
echo.

set /p choice="선택: "

if "%choice%"=="0" goto end
if "%choice%"=="1" goto clean_emulator
if "%choice%"=="2" goto clean_mobile
if "%choice%"=="3" goto clean_all

:clean_emulator
echo.
echo 에뮬레이터 완전 초기화 중...
echo.

:: 앱 실행 중지
adb -s emulator-5554 shell am force-stop com.posty

:: 앱 데이터 삭제
echo 앱 데이터 삭제 중...
adb -s emulator-5554 shell pm clear com.posty

:: 앱 삭제
echo 앱 삭제 중...
adb -s emulator-5554 uninstall com.posty

:: 캐시 삭제
echo 캐시 삭제 중...
adb -s emulator-5554 shell rm -rf /sdcard/Android/data/com.posty
adb -s emulator-5554 shell rm -rf /data/data/com.posty

echo.
echo 재설치 중...
call npx react-native run-android --deviceId emulator-5554
goto end

:clean_mobile
echo.
echo 모바일 기기 ID 입력:
set /p device_id="Device ID: "
echo.

echo %device_id% 완전 초기화 중...
echo.

:: 앱 실행 중지
adb -s %device_id% shell am force-stop com.posty

:: 앱 데이터 삭제
echo 앱 데이터 삭제 중...
adb -s %device_id% shell pm clear com.posty

:: 앱 삭제
echo 앱 삭제 중...
adb -s %device_id% uninstall com.posty

:: 캐시 삭제
echo 캐시 삭제 중...
adb -s %device_id% shell rm -rf /sdcard/Android/data/com.posty

echo.
echo 재설치 중...
call npx react-native run-android --deviceId %device_id%
goto end

:clean_all
echo.
echo 모든 기기 완전 초기화 중...

for /f "skip=1 tokens=1" %%i in ('adb devices') do (
    if not "%%i"=="List" (
        echo.
        echo %%i 초기화 중...
        adb -s %%i shell am force-stop com.posty
        adb -s %%i shell pm clear com.posty
        adb -s %%i uninstall com.posty
        adb -s %%i shell rm -rf /sdcard/Android/data/com.posty
    )
)

echo.
echo 빌드 및 재설치 중...
call cd android && gradlew clean && gradlew assembleDebug && cd ..

for /f "skip=1 tokens=1" %%i in ('adb devices') do (
    if not "%%i"=="List" (
        echo %%i에 설치 중...
        adb -s %%i install android/app/build/outputs/apk/debug/app-debug.apk
    )
)

:end
echo.
echo 완료!
pause