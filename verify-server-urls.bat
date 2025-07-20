@echo off
echo === Verify Server URLs ===
echo.

echo 1. Testing posty-server-new:
curl -I https://posty-server-new.vercel.app/api/health

echo.
echo.
echo 2. Testing posty-server (without -new):
curl -I https://posty-server.vercel.app/api/health

echo.
echo.
echo 3. Testing with different project names:
curl -I https://posty-server-xee3d.vercel.app/api/health
curl -I https://posty-server-git-main-xee3d.vercel.app/api/health

echo.
echo.
echo 4. Direct deployment URL test:
echo Check your Vercel dashboard for the actual deployment URL
echo It might look like: https://posty-server-[random].vercel.app
echo.

pause
