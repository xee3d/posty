@echo off
echo === Comprehensive Trend Debug ===
echo.

echo 1. Check if server is responding:
curl -i https://posty-api-v2.vercel.app/api/trends

echo.
echo.
echo 2. Check server health:
curl https://posty-api-v2.vercel.app/api/health

echo.
echo.
echo 3. Check for CORS headers:
curl -H "Origin: http://localhost" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS https://posty-api-v2.vercel.app/api/trends -v

echo.
echo.
echo 4. Check Vercel logs:
echo Visit: https://vercel.com/your-username/posty-api-v2/logs
echo.

echo 5. Clear app cache on device:
echo - Android: Settings > Apps > Posty > Storage > Clear Cache
echo - Or uninstall and reinstall the app
echo.

pause
