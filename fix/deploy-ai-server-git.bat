@echo off
echo ========================================
echo  Deploy AI Server via Git
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Check if posty-ai-server files are committed
echo [1/3] Checking Git status...
git status posty-ai-server/
echo.

:: 2. Add and commit if needed
echo [2/3] Do you want to commit AI server files?
choice /C YN /M "Commit changes"
if not errorlevel 2 (
    git add posty-ai-server/
    git commit -m "Setup AI server with health endpoint"
    git push origin main
    echo.
    echo Pushed to GitHub successfully!
)

:: 3. Instructions for Vercel
echo.
echo [3/3] Now complete the deployment in Vercel:
echo.
echo 1. Go to: https://vercel.com/new
echo 2. Import Git Repository
echo 3. Select: xee3d/Posty
echo 4. Configure:
echo    - Project Name: posty-ai-server
echo    - Framework Preset: Other
echo    - Root Directory: posty-ai-server
echo    - Build Command: (leave empty)
echo    - Output Directory: (leave empty)
echo 5. Click Deploy
echo.
echo After deployment, test:
echo https://posty-ai-server.vercel.app/api/health
echo.
pause