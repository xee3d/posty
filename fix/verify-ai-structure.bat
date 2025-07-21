@echo off
echo ========================================
echo  Verify AI Server Structure
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-ai-server

echo [1/4] Current directory structure:
dir /b
echo.

echo [2/4] API folder contents:
dir /b api
echo.

echo [3/4] Test health.js locally:
echo.
node -e "console.log('Testing health.js...'); try { const h = require('./api/health.js'); console.log('Module type:', typeof h.default); } catch(e) { console.error('Error:', e.message); }"
echo.

echo [4/4] Check if using ES modules or CommonJS:
type api\health.js | findstr "export default"
if errorlevel 1 (
    echo Using CommonJS
    type api\health.js | findstr "module.exports"
) else (
    echo Using ES Modules
)
echo.
pause