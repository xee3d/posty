@echo off
echo ========================================
echo  Deploy API Server via Git
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Check Git status
echo [1/4] Checking Git status...
cd posty-api-server
git status
echo.

:: 2. Add and commit changes
echo [2/4] Committing changes...
git add api/auth/custom-token.ts
git commit -m "Fix: Handle null photoURL in social login"
echo.

:: 3. Push to Git
echo [3/4] Pushing to Git repository...
git push origin main
echo.

:: 4. Vercel will auto-deploy if connected to Git
echo [4/4] Deployment Info:
echo.
echo If your Vercel project is connected to Git:
echo - Deployment will start automatically
echo - Check: https://vercel.com/dashboard
echo.
echo If not connected to Git:
echo 1. Go to Vercel Dashboard
echo 2. Select posty-api-server project
echo 3. Settings - Git
echo 4. Connect to your Git repository
echo 5. Set Root Directory: posty-api-server
echo.
cd ..
pause