@echo off
echo ========================================
echo Update to Correct Server URL
echo ========================================
echo.

echo The server is working! But the URL might be wrong.
echo.
echo Current URL in config:
echo https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app
echo.
echo But the actual URL might be different.
echo Let's check the correct URL...
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server
echo Getting the production URL...
vercel ls --limit 5
echo.
echo Look for the Production deployment URL above.
echo It might be different from what we have in config.
echo.
pause

echo.
echo If the URL is different, update it in:
echo src\config\api.js
echo.
echo Change BASE_URL to the correct URL from above.
echo.
pause
