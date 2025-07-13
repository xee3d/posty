@echo off
echo ========================================
echo NPM Install with Error Recovery
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Setting npm config...
npm config set legacy-peer-deps true
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

echo.
echo [2] Installing with error recovery...
npm install --legacy-peer-deps --verbose

if %errorlevel% neq 0 (
    echo.
    echo [3] Install failed, trying with --force...
    npm install --force --legacy-peer-deps
)

echo.
echo [4] Verifying critical packages...
if not exist "node_modules\react-native\package.json" (
    echo ERROR: react-native not installed!
    npm install react-native@0.74.5
)

if not exist "node_modules\@react-native-community\cli-platform-android\native_modules.gradle" (
    echo ERROR: CLI tools not installed!
    npm install @react-native-community/cli@latest
)

echo.
echo [5] Final check...
dir node_modules\@react-native-community\cli-platform-android\native_modules.gradle

echo.
pause