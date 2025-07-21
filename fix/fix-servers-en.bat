@echo off
chcp 949 > nul
echo ========================================
echo  Fix Posty Server Issues
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Check current server status
echo [1/4] Checking current server status...
echo.

echo === AI Server (posty-ai-server) ===
set AI_SERVERS=https://posty-server-new.vercel.app https://posty-server.vercel.app https://posty-server-xee3d.vercel.app
for %%s in (%AI_SERVERS%) do (
    echo Checking %%s...
    curl -s -o nul -w "  Status: %%{http_code} - " %%s/api/health
    curl -s %%s/api/health 2>nul | findstr "ok" >nul
    if not errorlevel 1 (
        echo [OK] Working
    ) else (
        echo [ERROR] No response
    )
)
echo.

echo === API Server (Trends Server) ===
set API_URL=https://posty-api.vercel.app
echo Checking %API_URL%...
curl -s -o nul -w "  Status: %%{http_code} - " %API_URL%/api/trends
curl -s %API_URL%/api/trends 2>nul | findstr "trends" >nul
if not errorlevel 1 (
    echo [OK] Working
) else (
    echo [ERROR] No response
)
echo.

:: 2. Check Vercel projects
echo [2/4] Checking Vercel project status...
echo.

:: Check AI server project
cd posty-ai-server
if exist vercel.json (
    echo [OK] AI server vercel.json found
    type vercel.json
) else (
    echo [ERROR] AI server vercel.json missing - creating...
    echo { > vercel.json
    echo   "functions": { >> vercel.json
    echo     "api/*.js": { >> vercel.json
    echo       "maxDuration": 30 >> vercel.json
    echo     } >> vercel.json
    echo   } >> vercel.json
    echo } >> vercel.json
)
echo.
cd ..

:: Check API server project
cd posty-api-server
if exist vercel.json (
    echo [OK] API server vercel.json found
    type vercel.json
) else (
    echo [ERROR] API server vercel.json missing - creating...
    echo { > vercel.json
    echo   "functions": { >> vercel.json
    echo     "api/*.js": { >> vercel.json
    echo       "maxDuration": 30 >> vercel.json
    echo     } >> vercel.json
    echo   }, >> vercel.json
    echo   "env": { >> vercel.json
    echo     "FIREBASE_SERVICE_ACCOUNT": "@firebase-service-account" >> vercel.json
    echo   } >> vercel.json
    echo } >> vercel.json
)
echo.
cd ..

:: 3. Verify server files
echo [3/4] Verifying server files...
echo.

:: Check AI server health check file
if exist posty-ai-server\api\health.js (
    echo [OK] AI server health.js exists
) else (
    echo [ERROR] AI server health.js missing - creating...
    mkdir posty-ai-server\api 2>nul
    echo export default function handler(req, res) { > posty-ai-server\api\health.js
    echo   res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }); >> posty-ai-server\api\health.js
    echo } >> posty-ai-server\api\health.js
)

:: Check API server trends file
if exist posty-api-server\api\trends.ts (
    echo [OK] API server trends.ts exists
) else (
    echo [ERROR] API server trends.ts missing!
    echo    Please check posty-api-server/api/ folder.
)
echo.

:: 4. Server redeployment
echo [4/4] Do you want to redeploy servers?
echo.
echo Note: Vercel CLI must be installed and logged in.
echo.
choice /C YN /M "Redeploy servers"
if errorlevel 2 goto :skip_deploy

:: Check Vercel CLI installation
where vercel >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERROR] Vercel CLI not installed!
    echo.
    echo Installing Vercel CLI...
    call npm install -g vercel
    echo.
    echo Vercel login required:
    call vercel login
)

echo.
echo === Redeploying AI Server ===
cd posty-ai-server
echo Current directory: %CD%
call vercel --prod --yes
if errorlevel 1 (
    echo.
    echo [ERROR] AI server deployment failed!
    echo Run manually:
    echo cd posty-ai-server
    echo vercel --prod
) else (
    echo [OK] AI server deployed successfully!
)
cd ..

echo.
echo === Redeploying API Server ===
cd posty-api-server
echo Current directory: %CD%
call vercel --prod --yes
if errorlevel 1 (
    echo.
    echo [ERROR] API server deployment failed!
    echo Run manually:
    echo cd posty-api-server
    echo vercel --prod
) else (
    echo [OK] API server deployed successfully!
)
cd ..

:skip_deploy
echo.
echo ========================================
echo  Server Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check deployed server URLs (Vercel Dashboard)
echo 2. Update API_URL in .env file
echo 3. Update server list in serverConfig.js
echo 4. Restart app to test server connection
echo.
echo If issues persist:
echo - Check function logs in Vercel Dashboard
echo - Verify Firebase service account key setup
echo - Check CORS settings
echo.
pause