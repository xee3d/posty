@echo off
echo Committing and pushing debug changes...
cd /d C:\Users\xee3d\Documents\Posty
git add posty-api-server/api/auth/custom-token.ts
git commit -m "debug: Add environment variable check"
git push origin main
echo Done! Check Vercel logs after deployment.
pause