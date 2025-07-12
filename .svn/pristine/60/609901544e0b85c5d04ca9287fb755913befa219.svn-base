@echo off
echo Checking .env configuration...
echo.

cd /d C:\Users\xee3d\Documents\Posty_V74

echo Current .env content:
echo ========================================
type .env
echo.
echo ========================================

echo.
echo Checking if react-native-dotenv is installed:
npm list react-native-dotenv

echo.
echo Metro cache locations:
if exist ".metro-cache" echo [Found] .metro-cache
if exist "metro-cache" echo [Found] metro-cache
if exist "%TEMP%\metro-cache" echo [Found] %TEMP%\metro-cache

echo.
echo Cleaning all caches...
rd /s /q .metro-cache 2>nul
rd /s /q metro-cache 2>nul
rd /s /q %TEMP%\metro-cache 2>nul

echo.
echo Done! Now restart Metro with: npx react-native start --reset-cache
pause
