@echo off
echo ========================================
echo     Android Build Cache Cleaner
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/6] Killing Java processes...
taskkill /F /IM java.exe >nul 2>&1
taskkill /F /IM javaw.exe >nul 2>&1
echo.

echo [2/6] Killing Gradle daemon...
cd android
call gradlew --stop
cd ..
echo.

echo [3/6] Removing build directories with force...
cd android

if exist .gradle (
    echo Removing .gradle...
    rmdir /s /q .gradle 2>nul
    if exist .gradle (
        echo Force removing .gradle...
        rd /s /q .gradle
    )
)

if exist build (
    echo Removing build...
    rmdir /s /q build 2>nul
)

cd app
if exist build (
    echo Removing app\build...
    rmdir /s /q build 2>nul
    if exist build (
        echo Force removing app\build...
        rd /s /q build
    )
)

if exist .cxx (
    echo Removing app\.cxx...
    rmdir /s /q .cxx 2>nul
)

cd ..\..
echo.

echo [4/6] Clearing temp files...
if exist %TEMP%\gradle-* del /q /f %TEMP%\gradle-* 2>nul
echo.

echo [5/6] Running gradle clean...
cd android
call gradlew clean
cd ..
echo.

echo [6/6] Verifying cleanup...
if exist android\app\build (
    echo WARNING: Some build files still exist
    echo Try running this script again or restart your computer
) else (
    echo SUCCESS: All build files cleaned!
)
echo.

echo ========================================
echo     Cleanup Complete!
echo ========================================
echo.
echo Now try: npx react-native run-android
echo.
pause