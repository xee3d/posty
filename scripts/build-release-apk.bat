@echo off
echo Building Release APK for distribution...
echo.

cd C:\Users\xee3d\Documents\Posty

:: Android 폴더로 이동
cd android

:: Clean build
echo Cleaning previous builds...
call gradlew clean

:: Release APK 빌드
echo Building release APK...
call gradlew assembleRelease

:: APK 위치 표시
echo.
echo Build complete!
echo.
echo Release APK location:
echo %cd%\app\build\outputs\apk\release\app-release.apk
echo.
echo You can share this APK file to install on any Android device.
echo.

:: 바탕화면에 복사 (선택사항)
echo Copying APK to Desktop...
copy "app\build\outputs\apk\release\app-release.apk" "%USERPROFILE%\Desktop\Posty-release.apk"

cd ..
pause
