@echo off
chcp 949 > nul
echo ========================================
echo  Posty App - Fix All Issues
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Check environment variables
echo [1/7] Checking environment variables...
echo.
if exist .env (
    echo [OK] .env file found
    findstr "NAVER_CONSUMER_KEY" .env > nul
    if errorlevel 1 (
        echo [ERROR] NAVER_CONSUMER_KEY is missing!
    ) else (
        echo [OK] NAVER_CONSUMER_KEY found
    )
    
    findstr "KAKAO_APP_KEY" .env > nul
    if errorlevel 1 (
        echo [ERROR] KAKAO_APP_KEY is missing!
    ) else (
        echo [OK] KAKAO_APP_KEY found
    )
    
    findstr "GOOGLE_WEB_CLIENT_ID" .env > nul
    if errorlevel 1 (
        echo [ERROR] GOOGLE_WEB_CLIENT_ID is missing!
    ) else (
        echo [OK] GOOGLE_WEB_CLIENT_ID found
    )
) else (
    echo [ERROR] .env file not found!
    copy .env.example .env
    echo [INFO] Copied .env.example - Please set your API keys.
)
echo.

:: 2. Generate key hashes
echo [2/7] Generating key hashes...
echo.
echo Please register these key hashes in each platform:
echo.
echo === NAVER Developer Center ===
cd android
gradlew signingReport 2>nul | findstr "SHA1" | findstr /n "^" | findstr "^1:"
cd ..
echo.
echo === KAKAO Developer Center ===
call get-key-hash.bat 2>nul
echo.

:: 3. Clean and reinstall dependencies
echo [3/7] Cleaning and reinstalling dependencies...
echo.
rd /s /q node_modules 2>nul
del package-lock.json 2>nul
call npm cache clean --force
call npm install
echo.

:: 4. Clean Android build
echo [4/7] Cleaning Android build...
echo.
cd android
call gradlew clean
cd ..
echo.

:: 5. Clean Metro cache
echo [5/7] Cleaning Metro cache...
echo.
rd /s /q %TEMP%\metro-cache 2>nul
rd /s /q %TEMP%\react-native-* 2>nul
echo.

:: 6. Check server status
echo [6/7] Checking server status...
echo.
echo AI Server check...
curl -s -o nul -w "Status: %%{http_code}\n" https://posty-server-new.vercel.app/api/health
echo.
echo API Server check...
curl -s -o nul -w "Status: %%{http_code}\n" https://posty-api.vercel.app/api/trends
echo.

:: 7. Server deployment
echo [7/7] Do you want to redeploy servers?
echo.
choice /C YN /M "Redeploy servers"
if errorlevel 2 goto :skip_deploy

echo.
echo Redeploying AI server...
cd posty-ai-server
call vercel --prod --yes
cd ..

echo.
echo Redeploying API server...
cd posty-api-server
call vercel --prod --yes
cd ..

:skip_deploy
echo.
echo ========================================
echo  All steps completed!
echo ========================================
echo.
echo Next steps:
echo 1. Verify all API keys in .env file
echo 2. Register key hashes in each platform
echo 3. Set OAuth redirect URIs in Firebase Console
echo 4. Restart the app for testing
echo.
echo Run app: npx react-native run-android
echo.
pause