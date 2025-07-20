@echo off
echo === Fix Vercel Domains ===
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-server

echo 1. Show current project info:
vercel

echo.
echo 2. List all aliases:
vercel alias ls

echo.
echo 3. Remove all old aliases:
vercel domains rm posty-server-new.vercel.app --yes 2>nul
vercel domains rm posty-server.vercel.app --yes 2>nul

echo.
echo 4. Deploy to production:
vercel --prod

echo.
echo 5. After deployment, copy the URL shown above and run:
echo    vercel alias [deployment-url] posty-server-new.vercel.app
echo.
echo Example:
echo    vercel alias posty-server-abc123.vercel.app posty-server-new.vercel.app
echo.

cd ..
pause
