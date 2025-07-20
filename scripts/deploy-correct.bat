@echo off
echo ========================================
echo Deploy with Environment Variables
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Creating local .env file...
echo OPENAI_API_KEY=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 > .env.local
echo APP_SECRET=posty-secret-key-change-this-in-production >> .env.local

echo.
echo Setting environment variables in Vercel...
echo.

echo Adding OPENAI_API_KEY...
vercel env add OPENAI_API_KEY production < .env.local
echo.

echo Adding APP_SECRET...
echo posty-secret-key-change-this-in-production | vercel env add APP_SECRET production
echo.

echo Environment variables added!
echo.
echo Now deploying...
vercel --prod --yes

echo.
echo Deployment complete!
echo.
pause
