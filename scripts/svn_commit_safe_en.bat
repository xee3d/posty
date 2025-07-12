@echo off
chcp 949
echo ========================================
echo SVN Commit with File Exclusion Check
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Checking files to exclude...
echo ----------------------------------------

REM Check and exclude items
if exist "node_modules\" (
    echo [Found] node_modules\ - Need to exclude
    svn propset svn:ignore "node_modules" .
)

if exist "android\build\" (
    echo [Found] android\build\ - Need to exclude
    cd android
    svn propset svn:ignore "build" .
    cd ..
)

if exist "android\app\build\" (
    echo [Found] android\app\build\ - Need to exclude
    cd android\app
    svn propset svn:ignore "build" .
    cd ..\..
)

if exist "android\.gradle\" (
    echo [Found] android\.gradle\ - Need to exclude
    cd android
    svn propset svn:ignore ".gradle" .
    cd ..
)

if exist "android\local.properties" (
    echo [Found] android\local.properties - Need to exclude
    cd android
    svn propset svn:ignore "local.properties" .
    cd ..
)

if exist ".env" (
    echo [Found] .env - Checking version control status
    svn status .env
)

echo.
echo ========================================
echo SVN Status Check (Including ignored files)
echo ========================================
svn status --no-ignore

echo.
echo ========================================
echo Files to be committed
echo ========================================
svn status

echo.
echo Press any key to continue...
pause

echo.
echo ========================================
echo Adding new files (excluding ignored)
echo ========================================
for /f "tokens=2" %%i in ('svn status ^| findstr "^?"') do (
    echo %%i | findstr /v "node_modules" | findstr /v "build" | findstr /v ".gradle" | findstr /v "local.properties" | findstr /v ".log" | findstr /v ".tmp" | findstr /v ".apk" | findstr /v ".aab" >nul
    if not errorlevel 1 (
        echo Adding: %%i
        svn add "%%i"
    )
)

echo.
echo ========================================
echo Final commit status
echo ========================================
svn status

echo.
echo ========================================
echo Ready to commit
echo ========================================
echo.
echo Commit message: "React Native 0.74.5 upgrade completed - 2025-07-11"
echo.
echo Do you want to commit? (Press Ctrl+C to cancel)
pause

svn commit -m "React Native 0.74.5 upgrade completed - 2025-07-11"

echo.
echo ========================================
echo SVN commit completed!
echo ========================================
pause
