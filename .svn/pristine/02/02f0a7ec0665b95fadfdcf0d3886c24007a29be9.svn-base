@echo off
chcp 949
echo ========================================
echo Emergency: Remove Build Files from SVN
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74_new

echo.
echo Removing build folders from SVN...
echo ========================================

REM Remove android build folders
svn rm --keep-local "android/.gradle" --force
svn rm --keep-local "android/app/build" --force
svn rm --keep-local "android/build" --force

REM Remove .env file
svn rm --keep-local ".env" --force

echo.
echo Setting proper ignore rules...
echo ========================================

REM Set ignore for android folder
cd android
echo .gradle > .svnignore_android
echo build >> .svnignore_android
echo local.properties >> .svnignore_android
svn propset svn:ignore -F .svnignore_android .
del .svnignore_android
cd ..

REM Set ignore for android/app folder
cd android\app
echo build > .svnignore_app
svn propset svn:ignore -F .svnignore_app .
del .svnignore_app
cd ..\..

REM Set ignore for root folder
echo node_modules > .svnignore_root
echo .env >> .svnignore_root
echo .env.local >> .svnignore_root
echo .env.backup >> .svnignore_root
echo *.log >> .svnignore_root
echo package-lock.json >> .svnignore_root
svn propset svn:ignore -F .svnignore_root .
del .svnignore_root

echo.
echo Reverting unwanted additions...
echo ========================================
svn revert -R android/.gradle
svn revert -R android/app/build
svn revert -R android/build
svn revert .env

echo.
echo Current status:
svn status

echo.
echo ========================================
echo Fixed! Now only commit the real source files.
echo ========================================
pause
