@echo off
echo ========================================
echo Promote Deployment to Production
echo ========================================
echo.
color 0A

echo Your latest deployment (C1dKGGa46) is "Staged"
echo You need to PROMOTE it to Production!
echo.

echo Steps:
echo 1. Click the "Promote" button on the latest deployment
echo 2. Confirm the promotion
echo 3. Wait for it to become "Production"
echo.

echo OR use command line:
echo.
echo cd C:\Users\xee3d\Documents\Posty\posty-server
echo vercel promote [deployment-url]
echo.

echo After promoting, the deployment should show:
echo - Status: Ready (green)
echo - Production (not Staged)
echo.
pause

echo.
echo Testing production URL...
curl -X GET "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/health" -H "Authorization: Bearer posty-secret-key-change-this-in-production"
echo.
pause
