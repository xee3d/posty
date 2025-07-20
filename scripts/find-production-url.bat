@echo off
echo ========================================
echo Find Correct Production URL
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Checking deployments...
vercel ls
echo.
echo Look for the deployment marked as "Production"
echo.
pause

echo.
echo Also checking project info...
vercel inspect
echo.
pause

echo.
echo The correct Production URL should be one of:
echo 1. posty-server.vercel.app
echo 2. posty-server-[username].vercel.app  
echo 3. posty-server-new.vercel.app
echo 4. Or the specific deployment URL shown above
echo.
echo Which URL shows the working API page in your browser?
echo.
pause

echo.
echo Once you know the correct URL, update it in:
echo src\config\api.js
echo.
echo Change this line:
echo BASE_URL: 'https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app',
echo.
echo To the correct URL that works in your browser.
echo.
pause
