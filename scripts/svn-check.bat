@echo off
REM Check what files are currently in SVN that shouldn't be

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo     Checking for unwanted files in SVN
echo ========================================
echo.

echo Files/folders that should NOT be in SVN:
echo ----------------------------------------

REM Check each directory/file that should be ignored
echo.
echo Checking node_modules...
svn info node_modules >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [!] node_modules is in SVN - should be removed
) else (
    echo [OK] node_modules is not in SVN
)

echo.
echo Checking build directories...
svn info android/build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [!] android/build is in SVN - should be removed
)

svn info android/app/build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [!] android/app/build is in SVN - should be removed
)

svn info android/.gradle >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [!] android/.gradle is in SVN - should be removed
)

echo.
echo Checking for log files...
for %%f in (*.log) do (
    svn info "%%f" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo [!] %%f is in SVN - should be removed
    )
)

echo.
echo Checking for local properties...
svn info android/local.properties >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [!] android/local.properties is in SVN - should be removed
)

echo.
echo ========================================
echo If any files were found above, run:
echo   svn-cleanup.bat
echo ========================================

pause