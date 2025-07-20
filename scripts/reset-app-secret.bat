@echo off
echo ========================================
echo Reset APP_SECRET
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Current APP_SECRET in code:
echo posty-secret-key-change-this-in-production
echo.

echo Updating APP_SECRET in Vercel...
echo.

echo 1. Remove old APP_SECRET:
vercel env rm APP_SECRET production
vercel env rm APP_SECRET preview
vercel env rm APP_SECRET development

echo.
echo 2. Add new APP_SECRET:
echo posty-secret-key-change-this-in-production| vercel env add APP_SECRET production preview development

echo.
echo 3. Verify it's set:
vercel env ls

echo.
echo 4. Redeploy:
vercel --prod --force

echo.
echo Wait for deployment, then test again.
echo.
pause
