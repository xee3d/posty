@echo off
echo ========================================
echo  Clean Deploy AI Server
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-ai-server

:: 1. Remove .vercel folder
echo [1/5] Cleaning Vercel cache...
rd /s /q .vercel 2>nul
echo.

:: 2. Check package.json
echo [2/5] Checking package.json...
if not exist package.json (
    echo Creating minimal package.json...
    echo { > package.json
    echo   "name": "posty-ai-server", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "description": "Posty AI Server", >> package.json
    echo   "scripts": {}, >> package.json
    echo   "dependencies": {} >> package.json
    echo } >> package.json
)
echo.

:: 3. Deploy with new settings
echo [3/5] Starting fresh deployment...
echo.
echo When prompted:
echo - Set up and deploy? Y
echo - Which scope? (Select your account)
echo - Link to existing project? Y
echo - What's the name? posty-ai-server
echo - In which directory? . (just press Enter)
echo.
pause

vercel

:: 4. After deployment
echo.
echo [4/5] After deployment completes, run:
echo vercel --prod
echo.

:: 5. Update app config
echo [5/5] Update src/config/serverConfig.js with the new URL
echo.
pause