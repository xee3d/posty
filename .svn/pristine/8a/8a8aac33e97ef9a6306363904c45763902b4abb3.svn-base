@echo off
chcp 949
echo ========================================
echo Fix Current Folder - Remove Build Files
echo ========================================

echo.
echo Removing build files from SVN tracking...
echo ========================================

REM Revert all build-related files
svn revert -R android\.gradle
svn revert -R android\app\build
svn revert -R android\build
svn revert .env

echo.
echo Setting ignore properties...
echo ========================================

REM Root folder ignores
(
echo node_modules
echo package-lock.json
echo .env
echo .env.local
echo .env.backup
echo *.log
echo *.apk
echo *.aab
) | svn propset svn:ignore -F - .

REM Android folder ignores
cd android
(
echo .gradle
echo build
echo local.properties
) | svn propset svn:ignore -F - .
cd ..

REM Android app folder ignores  
cd android\app
echo build | svn propset svn:ignore -F - .
cd ..\..

echo.
echo ========================================
echo Checking final status...
echo ========================================
svn status

echo.
echo Build files removed! Ready for clean commit.
pause
