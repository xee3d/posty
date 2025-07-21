@echo off
chcp 949 > nul
echo ========================================
echo  Fix Firebase Authentication Setup
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Check current Firebase configuration
echo [1/5] Checking Firebase configuration...
echo.

:: Check Firebase service account file
if exist firebase-service-account.json (
    echo [OK] Firebase service account file found
) else (
    echo [ERROR] firebase-service-account.json not found!
    echo.
    echo You need to:
    echo 1. Go to Firebase Console: https://console.firebase.google.com
    echo 2. Select your project: postyai-app
    echo 3. Project Settings - Service accounts
    echo 4. Generate new private key
    echo 5. Save as firebase-service-account.json in project root
    echo.
)

:: 2. Setup Vercel environment variables
echo.
echo [2/5] Setting up Vercel environment variables...
echo.
echo You need to add these environment variables in Vercel:
echo.
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select: posty-api-server project
echo 3. Go to: Settings - Environment Variables
echo 4. Add these variables:
echo.

if exist firebase-service-account.json (
    echo Reading Firebase config...
    
    :: Extract values from JSON using PowerShell
    for /f "delims=" %%a in ('powershell -Command "Get-Content firebase-service-account.json | ConvertFrom-Json | Select -ExpandProperty project_id"') do set PROJECT_ID=%%a
    for /f "delims=" %%a in ('powershell -Command "Get-Content firebase-service-account.json | ConvertFrom-Json | Select -ExpandProperty client_email"') do set CLIENT_EMAIL=%%a
    
    echo.
    echo FIREBASE_PROJECT_ID = %PROJECT_ID%
    echo FIREBASE_CLIENT_EMAIL = %CLIENT_EMAIL%
    echo FIREBASE_PRIVATE_KEY = [Copy the private_key value from firebase-service-account.json]
    echo.
    echo NOTE: For FIREBASE_PRIVATE_KEY, copy the entire key including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----
) else (
    echo.
    echo FIREBASE_PROJECT_ID = postyai-app
    echo FIREBASE_CLIENT_EMAIL = [Get from service account JSON]
    echo FIREBASE_PRIVATE_KEY = [Get from service account JSON]
)

:: 3. Create local test server
echo.
echo [3/5] Creating local test configuration...
echo.

:: Create .env.local for API server
cd posty-api-server
if not exist .env.local (
    echo Creating .env.local for local testing...
    echo # Firebase Admin SDK Configuration > .env.local
    echo FIREBASE_PROJECT_ID=postyai-app >> .env.local
    echo FIREBASE_CLIENT_EMAIL=your-client-email@postyai-app.iam.gserviceaccount.com >> .env.local
    echo FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" >> .env.local
    echo.
    echo [INFO] Created .env.local template - Update with your values
) else (
    echo [OK] .env.local already exists
)
cd ..

:: 4. Quick fix attempt
echo.
echo [4/5] Attempting quick fix...
echo.

:: Update API server to include Firebase config
cd posty-api-server\api\auth
if exist custom-token.ts (
    echo [OK] custom-token.ts exists
    
    :: Create a backup
    copy custom-token.ts custom-token.ts.bak >nul 2>&1
    
    echo.
    echo Current auth endpoint is missing Firebase initialization.
    echo You need to either:
    echo 1. Set environment variables in Vercel Dashboard
    echo 2. OR use a service account JSON file
)
cd ..\..\..

:: 5. Test and deploy
echo.
echo [5/5] Ready to test and deploy?
echo.
choice /C YN /M "Deploy fixed authentication server"
if errorlevel 2 goto :skip_deploy

echo.
echo Deploying API server with fixes...
cd posty-api-server

:: Check if logged in to Vercel
where vercel >nul 2>nul
if errorlevel 1 (
    echo Installing Vercel CLI...
    call npm install -g vercel
    echo Please login to Vercel:
    call vercel login
)

echo.
echo Deploying to Vercel...
call vercel --prod

echo.
echo [IMPORTANT] After deployment:
echo 1. Go to Vercel Dashboard
echo 2. Add the Firebase environment variables
echo 3. Redeploy for changes to take effect

cd ..

:skip_deploy
echo.
echo ========================================
echo  Firebase Setup Instructions
echo ========================================
echo.
echo IMMEDIATE ACTIONS REQUIRED:
echo.
echo 1. Download Firebase Service Account Key:
echo    - Go to: https://console.firebase.google.com
echo    - Project: postyai-app
echo    - Settings - Service accounts - Generate new private key
echo.
echo 2. Add to Vercel Environment Variables:
echo    - Go to: https://vercel.com/dashboard
echo    - Select: posty-api-server
echo    - Settings - Environment Variables
echo    - Add: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
echo.
echo 3. Redeploy the API server:
echo    cd posty-api-server
echo    vercel --prod
echo.
echo 4. Test login again in the app
echo.
pause