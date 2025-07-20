@echo off
echo ========================================
echo Checking Posty Server Status
echo ========================================
echo.

echo 1. Testing current server (posty-server-new):
echo -----------------------------------------
curl -I https://posty-server-new.vercel.app
echo.
curl https://posty-server-new.vercel.app/api/health
echo.
echo.

echo 2. Testing alternative server (posty-server):
echo -----------------------------------------
curl -I https://posty-server.vercel.app
echo.
curl https://posty-server.vercel.app/api/health
echo.
echo.

echo 3. Testing with timeout and verbose:
echo -----------------------------------------
curl -v --connect-timeout 10 https://posty-server-new.vercel.app/api/health
echo.

pause
