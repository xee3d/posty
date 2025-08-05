@echo off
echo ========================================
echo React Native iOS Complete Clean Build
echo ========================================
echo.

echo [1/8] Stopping Metro bundler...
taskkill /f /im node.exe 2>nul || echo Metro bundler not running

echo [2/8] Cleaning React Native cache...
npx react-native start --reset-cache --stop 2>nul
rmdir /s /q %TEMP%\metro-* 2>nul
rmdir /s /q %TEMP%\haste-map-* 2>nul

echo [3/8] Clearing Watchman cache...
watchman watch-del-all 2>nul || echo Watchman not available

echo [4/8] Removing iOS build artifacts...
rmdir /s /q ios\build 2>nul
rmdir /s /q ios\Pods 2>nul
del ios\Podfile.lock 2>nul

echo [5/8] Clearing Xcode DerivedData...
rmdir /s /q "%HOME%\Library\Developer\Xcode\DerivedData" 2>nul

echo [6/8] Clearing npm/yarn cache...
npm cache clean --force
yarn cache clean 2>nul || echo Yarn not available

echo [7/8] Reinstalling dependencies...
npm install
cd ios && pod install && cd ..

echo [8/8] Applying patches...
npx patch-package

echo.
echo ========================================
echo Clean build completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run ios
echo 2. Or use Xcode to build the project
echo.
pause