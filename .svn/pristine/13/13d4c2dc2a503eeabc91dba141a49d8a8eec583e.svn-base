@echo off
echo Setting global ignore for build folders...

cd /d C:\Users\xee3d\Documents\Posty_V74

REM Clean any existing tracked build files
svn cleanup
svn rm --keep-local android/app/build --force 2>nul
svn rm --keep-local android/build --force 2>nul
svn rm --keep-local android/.gradle --force 2>nul

REM Set comprehensive ignore
svn propset svn:global-ignores "build .gradle *.apk *.aab node_modules" . --recursive

echo Done! Build folders will be permanently ignored.
pause
