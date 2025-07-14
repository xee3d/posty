@echo off
echo Building Posty for Release...
echo.

cd android

echo [1/3] Cleaning previous builds...
call gradlew clean

echo.
echo [2/3] Building release bundle...
call gradlew bundleRelease

echo.
echo [3/3] Build complete!
echo.
echo Release bundle location:
echo android\app\build\outputs\bundle\release\app-release.aab
echo.
pause
