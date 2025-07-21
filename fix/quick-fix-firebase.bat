@echo off
echo ========================================
echo  Quick Fix: Firebase Authentication
echo ========================================
echo.
echo The error shows: "Firebase Admin SDK not initialized"
echo.
echo This happens because the API server (posty-api-server) 
echo doesn't have Firebase credentials configured.
echo.
echo ========================================
echo  SOLUTION:
echo ========================================
echo.
echo 1. Open Vercel Dashboard:
echo    https://vercel.com/dashboard
echo.
echo 2. Find and click on: posty-api-server
echo.
echo 3. Go to: Settings tab - Environment Variables
echo.
echo 4. Add these 3 variables:
echo.
echo    FIREBASE_PROJECT_ID
echo    Value: postyai-app
echo.
echo    FIREBASE_CLIENT_EMAIL  
echo    Value: (get from Firebase Console - see below)
echo.
echo    FIREBASE_PRIVATE_KEY
echo    Value: (get from Firebase Console - see below)
echo.
echo 5. To get the values:
echo    - Go to: https://console.firebase.google.com
echo    - Select: postyai-app project
echo    - Go to: Project Settings (gear icon)
echo    - Tab: Service accounts
echo    - Click: Generate new private key
echo    - Open the downloaded JSON file
echo    - Copy client_email and private_key values
echo.
echo 6. After adding all variables, redeploy:
echo    - Still in Vercel Dashboard
echo    - Go to Deployments tab
echo    - Click ... menu on latest deployment
echo    - Select: Redeploy
echo.
echo ========================================
echo.
echo Press any key to open Vercel Dashboard...
pause > nul
start https://vercel.com/dashboard
echo.
echo Press any key to open Firebase Console...
pause > nul
start https://console.firebase.google.com
echo.
pause