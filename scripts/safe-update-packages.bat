@echo off
chcp 65001 >nul
echo ========================================
echo     Posty Package Safe Update
echo     (React Native 0.72.6 Compatible)
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

REM 1. Backup current state
echo [1/7] Backing up package.json...
copy package.json package.json.backup
echo.

REM 2. Security updates only
echo [2/7] Checking security vulnerabilities...
call npm audit
echo.

echo [3/7] Applying security updates...
call npm audit fix
echo.

REM 3. Update only RN 0.72.6 compatible packages
echo [4/7] Updating compatible packages...

REM AsyncStorage update (compatible version)
call npm install @react-native-async-storage/async-storage@^1.19.8

REM Other safe updates
call npm install crypto-js@^4.2.0
call npm install react-native-dotenv@^3.4.11

echo.

REM 4. Update dev dependencies
echo [5/7] Updating development tools...
call npm install --save-dev @typescript-eslint/eslint-plugin@^5.62.0
call npm install --save-dev @typescript-eslint/parser@^5.62.0
call npm install --save-dev prettier@^2.8.8
echo.

REM 5. Check update results
echo [6/7] Update results...
call npm list --depth=0
echo.

REM 6. Recheck vulnerabilities
echo [7/7] Final security check...
call npm audit
echo.

echo ========================================
echo     Update Complete!
echo ========================================
echo.
echo Notes:
echo - React Native 0.72.6 compatibility maintained
echo - No major updates performed
echo - Restore with package.json.backup if needed
echo.
echo Next steps:
echo 1. Clean Android: cd android ^&^& gradlew clean
echo 2. Test app: npx react-native run-android
echo.
pause