@echo off
echo Cleaning Java/Gradle memory and cache...

:: Kill all Java processes
echo Killing Java processes...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM javaw.exe 2>nul

:: Clean Gradle cache
echo Cleaning Gradle cache...
cd /d %USERPROFILE%\.gradle
if exist caches (
    echo Removing Gradle caches...
    rmdir /s /q caches 2>nul
)
if exist daemon (
    echo Removing Gradle daemon...
    rmdir /s /q daemon 2>nul
)

:: Clean project build
echo Cleaning project build...
cd /d C:\Users\xee3d\Documents\Posty_V74
if exist android\build (
    rmdir /s /q android\build
)
if exist android\app\build (
    rmdir /s /q android\app\build
)
if exist android\.gradle (
    rmdir /s /q android\.gradle
)

:: Clean React Native cache
echo Cleaning React Native cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
)
if exist %LOCALAPPDATA%\Temp\metro-cache (
    rmdir /s /q %LOCALAPPDATA%\Temp\metro-cache
)
if exist %LOCALAPPDATA%\Temp\haste-map-metro (
    rmdir /s /q %LOCALAPPDATA%\Temp\haste-map-metro
)

echo.
echo Cleanup complete!
echo.
echo To rebuild the project:
echo 1. cd android
echo 2. gradlew clean
echo 3. cd ..
echo 4. npx react-native run-android
echo.
pause
