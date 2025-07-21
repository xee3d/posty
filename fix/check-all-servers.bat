@echo off
echo ========================================
echo  Check All Server Status
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/3] API Server (Trends) Check:
echo =====================================
curl -s https://posty-api.vercel.app/api/health
echo.
echo.
curl -s https://posty-api.vercel.app/api/trends | findstr /C:"trends" >nul
if errorlevel 1 (
    echo [ERROR] Trends API not working!
    curl -s https://posty-api.vercel.app/api/trends
) else (
    echo [OK] Trends API is working
)
echo.

echo [2/3] AI Server Check:
echo =====================================
echo Checking multiple AI server URLs...
echo.

set AI_URLS=https://posty-ai-server.vercel.app https://posty-server-new.vercel.app https://posty-server.vercel.app

for %%u in (%AI_URLS%) do (
    echo Checking %%u/api/health
    curl -s -o nul -w "Status: %%{http_code} " %%u/api/health
    curl -s %%u/api/health | findstr "healthy" >nul
    if not errorlevel 1 (
        echo [OK]
        echo Working AI Server: %%u
        echo.
    ) else (
        echo [FAIL]
    )
)

echo.
echo [3/3] Server Config Check:
echo =====================================
type src\config\serverConfig.js | findstr "SERVERS"
echo.

pause