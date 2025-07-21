@echo off
chcp 949 > nul
echo ========================================
echo  Fix Social Login Issues
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Generate key hashes
echo [1/5] Generating debug key hashes...
echo.

:: Extract SHA1 using Java keytool
echo SHA1 fingerprint:
cd android
for /f "tokens=2" %%a in ('gradlew signingReport 2^>nul ^| findstr "SHA1"') do (
    set SHA1=%%a
    goto :found_sha1
)
:found_sha1
cd ..
echo %SHA1%
echo.

:: Generate Kakao key hash
echo Kakao key hash:
if exist android\app\debug.keystore (
    keytool -exportcert -alias androiddebugkey -keystore android\app\debug.keystore -storepass android | openssl sha1 -binary | openssl base64
) else (
    echo [ERROR] debug.keystore not found!
)
echo.

:: Naver information
echo Naver registration info:
echo - Package name: com.posty
echo - SHA1: %SHA1%
echo.

:: 2. Platform setup guide
echo [2/5] Platform Setup Guide
echo.
echo === KAKAO Developer Center ===
echo 1. Visit https://developers.kakao.com
echo 2. Select My Application - Posty
echo 3. App Settings - Platform - Register Android
echo 4. Package name: com.posty
echo 5. Key hash: Use the generated Kakao key hash above
echo 6. Kakao Login - Enable
echo.

echo === NAVER Developer Center ===
echo 1. Visit https://developers.naver.com
echo 2. Select My Application - Posty
echo 3. API Settings - Android Settings
echo 4. Package name: com.posty
echo 5. SHA1: %SHA1%
echo 6. Enable Naver ID Login
echo.

echo === Google Firebase Console ===
echo 1. Visit https://console.firebase.google.com
echo 2. Select Posty project
echo 3. Authentication - Sign-in method
echo 4. Enable Google sign-in
echo 5. Project settings - General - Android app
echo 6. Add SHA1 fingerprint: %SHA1%
echo.

:: 3. Check environment variables
echo [3/5] Checking environment variables...
echo.
set MISSING_KEYS=0

findstr "NAVER_CONSUMER_KEY" .env > nul
if errorlevel 1 (
    echo [ERROR] NAVER_CONSUMER_KEY not set!
    echo    Add to .env: NAVER_CONSUMER_KEY=your_key_here
    set MISSING_KEYS=1
)

findstr "NAVER_CONSUMER_SECRET" .env > nul
if errorlevel 1 (
    echo [ERROR] NAVER_CONSUMER_SECRET not set!
    echo    Add to .env: NAVER_CONSUMER_SECRET=your_secret_here
    set MISSING_KEYS=1
)

findstr "KAKAO_APP_KEY" .env > nul
if errorlevel 1 (
    echo [ERROR] KAKAO_APP_KEY not set!
    echo    Add to .env: KAKAO_APP_KEY=your_key_here
    set MISSING_KEYS=1
)

findstr "GOOGLE_WEB_CLIENT_ID" .env > nul
if errorlevel 1 (
    echo [ERROR] GOOGLE_WEB_CLIENT_ID not set!
    echo    Add to .env: GOOGLE_WEB_CLIENT_ID=your_client_id_here
    set MISSING_KEYS=1
)

if %MISSING_KEYS%==0 (
    echo [OK] All environment variables are set.
)
echo.

:: 4. Check native configuration files
echo [4/5] Checking native configuration files...
echo.

:: Check Android Manifest
if exist android\app\src\main\AndroidManifest.xml (
    findstr "kakao" android\app\src\main\AndroidManifest.xml > nul
    if errorlevel 1 (
        echo [WARNING] Kakao settings might be missing in AndroidManifest.xml
    ) else (
        echo [OK] Kakao settings found
    )
) else (
    echo [ERROR] AndroidManifest.xml not found!
)

:: 5. Clean build
echo.
echo [5/5] Do you want to perform a clean build?
choice /C YN /M "Perform clean build"
if errorlevel 2 goto :skip_build

echo.
echo Killing Metro bundler...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" 2>nul

echo.
echo Cleaning Android build...
cd android
call gradlew clean
cd ..

echo.
echo Starting app with cache cleared...
start cmd /c "npx react-native start --reset-cache"
timeout /t 3 /nobreak > nul
npx react-native run-android

:skip_build
echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Checklist:
echo [x] Key hashes generated
echo [ ] Register key hash in Kakao Developer Center
echo [ ] Register SHA1 in Naver Developer Center
echo [ ] Register SHA1 in Firebase Console
echo [ ] Set all keys in .env file
echo [ ] Test social login in app
echo.
pause