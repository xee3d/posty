@echo off
chcp 949
echo ========================================
echo Complete SVN Reset - Remove ALL build files
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo STEP 1: Reverting ALL additions...
echo ========================================
svn revert -R .

echo.
echo STEP 2: Setting ignore BEFORE adding files...
echo ========================================

REM Root ignores
(
echo node_modules
echo package-lock.json
echo .env
echo .env.local
echo .env.backup
echo *.log
echo *.apk
echo *.aab
echo *.ipa
echo .metro-health-check*
echo metro-cache
echo temp
echo logs
) > .svnignore
svn propset svn:ignore -F .svnignore .
del .svnignore

REM Android ignores
cd android
(
echo build
echo .gradle
echo local.properties
echo *.iml
) > .svnignore
svn propset svn:ignore -F .svnignore .
del .svnignore

REM Android app ignores
cd app
(
echo build
) > .svnignore
svn propset svn:ignore -F .svnignore .
del .svnignore
cd ..\..

echo.
echo STEP 3: Adding ONLY source files...
echo ========================================

REM Add only specific files/folders
svn add *.md --force 2>nul
svn add *.json --force 2>nul
svn add *.js --force 2>nul
svn add *.tsx --force 2>nul
svn add *.ts --force 2>nul
svn add src --force 2>nul
svn add scripts --force 2>nul
svn add android\app\src --force 2>nul
svn add android\*.gradle --force 2>nul
svn add android\gradle.properties --force 2>nul
svn add android\gradlew* --force 2>nul
svn add android\settings.gradle --force 2>nul

echo.
echo STEP 4: Final status check...
echo ========================================
svn status

echo.
echo ========================================
echo NOW only source files are staged!
echo Build folders are properly ignored!
echo ========================================
pause
