@echo off
REM SVN Setup Script for Molly Project
REM Run this once to configure SVN ignore patterns

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo     Setting up SVN ignore patterns
echo ========================================
echo.

REM Set ignore patterns for root directory
echo Setting ignore patterns for root directory...
svn propset svn:ignore -F .svnignore-root .
if %ERRORLEVEL% EQU 0 (
    echo [OK] Root directory ignore patterns set
) else (
    echo [FAIL] Failed to set root directory ignore patterns
)

REM Set ignore patterns for android directory
echo.
echo Setting ignore patterns for android directory...
svn propset svn:ignore -F .svnignore-android android
if %ERRORLEVEL% EQU 0 (
    echo [OK] Android directory ignore patterns set
) else (
    echo [FAIL] Failed to set android directory ignore patterns
)

REM Set ignore patterns for android/app directory
echo.
echo Setting ignore patterns for android/app directory...
svn propset svn:ignore -F .svnignore-android-app android/app
if %ERRORLEVEL% EQU 0 (
    echo [OK] Android/app directory ignore patterns set
) else (
    echo [FAIL] Failed to set android/app directory ignore patterns
)

REM Show current ignore settings
echo.
echo ========================================
echo Current ignore settings:
echo ========================================
echo.
echo Root directory:
svn propget svn:ignore .
echo.
echo ----------------------------------------
echo Android directory:
svn propget svn:ignore android
echo.
echo ----------------------------------------
echo Android/app directory:
svn propget svn:ignore android/app
echo.
echo ========================================
echo SVN ignore patterns configured!
echo.
echo Next steps:
echo 1. Run 'svn-commit.bat' to commit these changes
echo 2. Use 'svn-commit.bat' for future commits
echo.
echo Note: The .svnignore-* files can be deleted after setup
echo ========================================

pause