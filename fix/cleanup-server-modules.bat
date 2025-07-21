@echo off
echo ========================================
echo  Remove Server node_modules from Git
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Check Git status
echo [1/4] Checking if node_modules are tracked...
git ls-files | findstr "posty-api-server/node_modules" >nul
if errorlevel 1 (
    echo [OK] posty-api-server/node_modules not tracked by Git
) else (
    echo [WARNING] posty-api-server/node_modules is tracked by Git!
)

git ls-files | findstr "posty-ai-server/node_modules" >nul
if errorlevel 1 (
    echo [OK] posty-ai-server/node_modules not tracked by Git
) else (
    echo [WARNING] posty-ai-server/node_modules is tracked by Git!
)
echo.

:: 2. Remove from Git tracking
echo [2/4] Removing from Git tracking...
git rm -r --cached posty-api-server/node_modules 2>nul
git rm -r --cached posty-ai-server/node_modules 2>nul
echo.

:: 3. Delete local node_modules
echo [3/4] Delete server node_modules folders?
echo This will reduce disk space and Vercel will install them during deployment.
choice /C YN /M "Delete server node_modules"
if not errorlevel 2 (
    rd /s /q posty-api-server\node_modules 2>nul
    rd /s /q posty-ai-server\node_modules 2>nul
    echo Deleted server node_modules folders
)
echo.

:: 4. Commit changes
echo [4/4] Commit changes?
choice /C YN /M "Commit to Git"
if not errorlevel 2 (
    git add .
    git commit -m "Remove server node_modules from Git tracking"
    git push origin main
)

echo.
echo ========================================
echo  Cleanup Complete!
echo ========================================
echo.
echo Server folders should only contain:
echo - api/ (functions)
echo - package.json
echo - vercel.json
echo - .gitignore
echo.
echo Vercel will install dependencies during deployment.
echo.
pause