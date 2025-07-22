@echo off
chcp 65001 > nul
echo === Cleanup Unnecessary Batch Files ===
echo.

cd /d "C:\Users\xee3d\Documents\Posty"

echo Removing duplicate and unnecessary batch files...

del "check-ai-server.bat" 2>nul
del "check-git-structure.bat" 2>nul
del "check-vercel-projects.bat" 2>nul
del "debug-trends-comprehensive.bat" 2>nul
del "force-server-deploy.bat" 2>nul
del "git-push-upstream.bat" 2>nul
del "setup-vercel-git.bat" 2>nul
del "test-api-endpoints.bat" 2>nul
del "trigger-auto-deploy.bat" 2>nul
del "update-api-config.bat" 2>nul
del "verify-server-urls.bat" 2>nul
del "fix-domain-assignment.bat" 2>nul
del "fix-vercel-domains.bat" 2>nul
del "redeploy-with-fix.bat" 2>nul
del "cleanup-and-commit.bat" 2>nul
del "trend-debug-code.tsx" 2>nul
del "General" 2>nul

echo.
echo Done!
echo.

pause
