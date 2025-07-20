@echo off
echo ========================================
echo Test Trends API URLs
echo ========================================
echo.

echo Latest deployment (4m ago):
echo Testing: https://posty-api-v2-iuqvopqf9-ethan-chois-projects.vercel.app
curl https://posty-api-v2-iuqvopqf9-ethan-chois-projects.vercel.app/api/health
echo.
curl https://posty-api-v2-iuqvopqf9-ethan-chois-projects.vercel.app/api/trends
echo.
echo.

echo Also testing the main domain:
echo Testing: https://posty-api-v2.vercel.app
curl https://posty-api-v2.vercel.app/api/health
echo.
curl https://posty-api-v2.vercel.app/api/trends
echo.
echo.

echo If the specific deployment URL works but main domain doesn't,
echo we need to promote the deployment or check domain settings.
echo.
pause
