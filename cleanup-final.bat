@echo off
cd /d C:\Users\xee3d\Documents\Posty

echo ========================================
echo Cleaning up temporary files
echo ========================================
echo.

echo Removing temporary batch files...
del apply-working-version.bat
del build-debug-apk.bat
del cleanup-temp-files.bat
del commit-changes.bat
del deploy-api.bat
del fix-api-deployment.bat
del force-restore.bat
del fresh-install.bat
del git-check.bat
del git-commit-fix.bat
del rebuild-phone.bat
del safe-recovery.bat
del redeploy-api-v2.bat

echo.
echo Removing temporary scripts...
del clear-trend-cache.js
del health-check.js
del monitor-servers.js
del patch-trend-service.js
del parseApiTrends-fix.ts
del working_trendService_full.ts

echo.
echo Removing temporary service files...
del src\services\trendServiceErrorPatch.ts
del src\services\trendServiceFallback.ts

echo.
echo Keeping useful files:
echo - start-metro.bat (Metro bundler starter)
echo - install-phone.bat (Phone installer)
echo - monitor-servers-live.bat (Server monitor)
echo.

echo Done! Check remaining files with: git status
pause
