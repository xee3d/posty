@echo off
echo ========================================
echo  Fix Vercel Build Configuration
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-ai-server

:: 1. Show current vercel.json
echo [1/5] Current vercel.json:
type vercel.json
echo.
echo.

:: 2. Check git status
echo [2/5] Git status:
git status vercel.json
echo.

:: 3. Add and commit if needed
echo [3/5] Committing vercel.json changes...
git add vercel.json
git add api/hello.js
git commit -m "Fix: Remove builds from vercel.json, use functions instead"
echo.

:: 4. Push to GitHub
echo [4/5] Pushing to GitHub...
git push origin main
echo.

:: 5. Info
echo [5/5] After push completes:
echo - Vercel will auto-deploy
echo - Check Functions tab in Vercel Dashboard
echo - Test: https://posty-ai.vercel.app/api/hello
echo - Test: https://posty-ai.vercel.app/api/health
echo.
pause