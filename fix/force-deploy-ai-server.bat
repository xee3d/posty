@echo off
echo ========================================
echo  Force Redeploy AI Server
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Make small change to trigger deployment
echo [1/4] Creating deployment trigger...
cd posty-ai-server
echo. >> README.md
echo ## Deployed on %date% %time% >> README.md
cd ..

:: 2. Commit and push
echo [2/4] Committing changes...
git add posty-ai-server/README.md
git commit -m "Trigger AI server redeployment"
git push origin main
echo.

:: 3. Manual deployment option
echo [3/4] Manual deployment option...
echo.
echo If Git deployment doesn't work, deploy manually:
echo.
cd posty-ai-server
echo Current directory: %CD%
echo.
choice /C YN /M "Deploy manually with Vercel CLI"
if not errorlevel 2 (
    vercel --prod
)
cd ..

:: 4. Wait and test
echo.
echo [4/4] Wait for deployment (1-2 minutes)...
echo Then test: https://posty-ai-server.vercel.app/api/health
echo.
pause