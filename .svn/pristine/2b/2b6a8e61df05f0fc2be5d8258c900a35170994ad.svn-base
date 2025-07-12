@echo off
REM Resolve package-lock.json conflicts

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo  Resolving package-lock.json conflicts
echo ========================================
echo.

REM Check for conflicts
svn status | findstr "^C.*package-lock.json" >nul
if %ERRORLEVEL% NEQ 0 (
    echo No conflicts found in package-lock.json
    pause
    exit /b 0
)

echo Conflict detected in package-lock.json
echo.
echo Resolving by regenerating package-lock.json...

REM Backup current state
copy package-lock.json package-lock.json.backup

REM Accept their version temporarily
svn resolve --accept theirs-full package-lock.json

REM Delete and regenerate
del package-lock.json
npm install

echo.
echo package-lock.json regenerated!
echo Please test the app before committing.

pause