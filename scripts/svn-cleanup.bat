@echo off
REM SVN Clean-up Script - Remove ignored files from repository
REM This removes files that should not be in SVN

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo     SVN Repository Cleanup
echo ========================================
echo.
echo This will remove unnecessary files from SVN
echo (but keep them on your local disk)
echo.

REM Check and remove node_modules
echo Checking for node_modules in SVN...
svn info node_modules >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FOUND] Removing node_modules from SVN...
    svn rm --keep-local node_modules
    echo [OK] node_modules removed from SVN
) else (
    echo [SKIP] node_modules not in SVN
)

REM Check and remove android/build
echo.
echo Checking for android/build in SVN...
svn info android/build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FOUND] Removing android/build from SVN...
    svn rm --keep-local android/build
    echo [OK] android/build removed from SVN
) else (
    echo [SKIP] android/build not in SVN
)

REM Check and remove android/.gradle
echo.
echo Checking for android/.gradle in SVN...
svn info android/.gradle >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FOUND] Removing android/.gradle from SVN...
    svn rm --keep-local android/.gradle
    echo [OK] android/.gradle removed from SVN
) else (
    echo [SKIP] android/.gradle not in SVN
)

REM Check and remove android/app/build
echo.
echo Checking for android/app/build in SVN...
svn info android/app/build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FOUND] Removing android/app/build from SVN...
    svn rm --keep-local android/app/build
    echo [OK] android/app/build removed from SVN
) else (
    echo [SKIP] android/app/build not in SVN
)

REM Check for log files
echo.
echo Checking for log files in SVN...
for %%f in (*.log) do (
    svn info "%%f" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo [FOUND] Removing %%f from SVN...
        svn rm --keep-local "%%f"
    )
)

REM Check for APK files
echo.
echo Checking for APK files in SVN...
for /r android %%f in (*.apk) do (
    svn info "%%f" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo [FOUND] Removing %%f from SVN...
        svn rm --keep-local "%%f"
    )
)

echo.
echo ========================================
echo Cleanup complete!
echo.
echo To finalize the removal, commit these changes:
echo   svn-commit.bat
echo.
echo Note: Files are removed from SVN but kept locally
echo ========================================

pause