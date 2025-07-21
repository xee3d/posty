@echo off
echo ========================================
echo  Debug and Fix AI Server Deployment
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-ai-server

:: 1. Test local function
echo [1/5] Testing local function...
node -e "const handler = require('./api/health.js').default; handler({method:'GET'}, {setHeader:()=>{},status:()=>({json:(d)=>console.log(JSON.stringify(d,null,2))})})"
echo.

:: 2. Check vercel.json
echo [2/5] Current vercel.json:
type vercel.json
echo.

:: 3. Force redeploy
echo [3/5] Force redeployment...
echo.
choice /C YN /M "Redeploy with Vercel CLI"
if not errorlevel 2 (
    vercel --prod --force
)

:: 4. Alternative: Delete and recreate
echo.
echo [4/5] If still not working, try:
echo 1. Go to Vercel Dashboard
echo 2. posty-ai project - Settings - Delete Project
echo 3. Run: vercel (create new project)
echo 4. Project name: posty-ai
echo.

:: 5. Test endpoints
echo [5/5] Test these URLs after deployment:
echo - https://posty-ai.vercel.app/
echo - https://posty-ai.vercel.app/api/
echo - https://posty-ai.vercel.app/api/health
echo.
pause