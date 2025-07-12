@echo off
REM SVN Repository Initialization Script
REM Use this to add the project to SVN for the first time

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo     SVN Repository Initialization
echo ========================================
echo.

REM Check if already under version control
svn info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo This project is already under SVN control.
    pause
    exit /b 0
)

echo This will add the Molly project to SVN repository.
echo.
set /p REPO_URL="Enter SVN repository URL: "

if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty!
    pause
    exit /b 1
)

echo.
echo Importing project to SVN...
echo.

REM Create temporary directory for import
mkdir temp_import
xcopy /E /I /Q /Y /EXCLUDE:svn-import-exclude.txt . temp_import

REM Import to SVN
svn import temp_import "%REPO_URL%/Molly/trunk" -m "Initial import of Molly project"

REM Clean up
rmdir /s /q temp_import

echo.
echo Checking out working copy...
cd ..
move Molly Molly_backup
svn checkout "%REPO_URL%/Molly/trunk" Molly

echo.
echo ========================================
echo SVN initialization complete!
echo The original folder is backed up as Molly_backup
echo ========================================

pause