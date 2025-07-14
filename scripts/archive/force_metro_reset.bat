@echo off
echo ========================================
echo Force Metro Reset
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Killing all Node processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2] Deleting ALL Metro caches...
rd /s /q "%TEMP%\metro-*" 2>nul
rd /s /q "%TEMP%\haste-*" 2>nul
rd /s /q "%TEMP%\react-*" 2>nul
rd /s /q "%LOCALAPPDATA%\react-native" 2>nul
rd /s /q node_modules\.cache 2>nul

echo.
echo [3] Resetting Watchman...
watchman watch-del-all 2>nul
watchman shutdown-server 2>nul

echo.
echo [4] Clearing Babel cache...
rd /s /q .babel-cache 2>nul
del .babelrc.json 2>nul

echo.
echo [5] Starting fresh Metro...
set NODE_OPTIONS=--max-old-space-size=8192
npx react-native start --reset-cache --max-workers=2

pause