@echo off
chcp 949
echo ========================================
echo SVN Ignore Setup for Posty Project
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Creating comprehensive SVN ignore settings...
echo ========================================

REM Create ignore file for root directory
(
echo # Node.js
echo node_modules
echo package-lock.json
echo npm-debug.log*
echo yarn-error.log*
echo yarn-debug.log*
echo *.log
echo .npm
echo
echo # Environment files
echo .env
echo .env.local
echo .env.*.local
echo .env.backup
echo .env.production
echo .env.development
echo
echo # Metro bundler
echo .metro-health-check*
echo .metro-cache
echo metro-cache
echo
echo # Build outputs
echo *.apk
echo *.aab
echo *.ipa
echo *.jsbundle
echo
echo # Temporary files
echo *.tmp
echo *.temp
echo *.cache
echo temp
echo tmp
echo logs
echo
echo # OS files
echo .DS_Store
echo Thumbs.db
echo desktop.ini
echo
echo # IDE files
echo .idea
echo .vscode
echo *.iml
echo *.swp
echo *.swo
echo
echo # Test coverage
echo coverage
echo .nyc_output
echo
echo # Misc
echo .cache
echo .parcel-cache
echo .next
echo out
echo dist
echo build
) > .svnignore_root

echo Setting ignore for root directory...
svn propset svn:ignore -F .svnignore_root .
del .svnignore_root

echo.
echo ========================================
echo Setting Android specific ignores...
echo ========================================

cd android
(
echo # Gradle files
echo .gradle
echo build
echo local.properties
echo *.iml
echo .idea
echo
echo # Android Studio captures folder
echo captures
echo
echo # External native build folder
echo .externalNativeBuild
echo .cxx
echo
echo # Google Services
echo app/google-services.json
echo
echo # Keystore files (except debug)
echo *.jks
echo *.keystore
echo !debug.keystore
echo
echo # Android Profiling
echo *.hprof
) > .svnignore_android

svn propset svn:ignore -F .svnignore_android .
del .svnignore_android

echo.
echo Setting Android app specific ignores...
cd app
(
echo build
echo .cxx
) > .svnignore_app

svn propset svn:ignore -F .svnignore_app .
del .svnignore_app

cd ..\..

echo.
echo ========================================
echo Setting iOS specific ignores (if exists)...
echo ========================================

if exist "ios" (
    cd ios
    (
    echo # Xcode
    echo build
    echo DerivedData
    echo *.pbxuser
    echo !default.pbxuser
    echo *.mode1v3
    echo !default.mode1v3
    echo *.mode2v3
    echo !default.mode2v3
    echo *.perspectivev3
    echo !default.perspectivev3
    echo xcuserdata
    echo *.xccheckout
    echo *.moved-aside
    echo *.hmap
    echo *.ipa
    echo *.xcuserstate
    echo .xcode.env.local
    echo
    echo # CocoaPods
    echo Pods
    echo *.xcworkspace
    echo
    echo # Carthage
    echo Carthage/Build
    echo
    echo # fastlane
    echo fastlane/report.xml
    echo fastlane/Preview.html
    echo fastlane/screenshots
    echo fastlane/test_output
    echo
    echo # Code Injection
    echo iOSInjectionProject
    ) > .svnignore_ios
    
    svn propset svn:ignore -F .svnignore_ios .
    del .svnignore_ios
    cd ..
)

echo.
echo ========================================
echo Creating global ignore configuration...
echo ========================================

REM Set global ignores (applies recursively)
svn propset svn:global-ignores "*.log *.tmp *.temp *.cache .DS_Store Thumbs.db desktop.ini" . --recursive

echo.
echo ========================================
echo Checking current ignore status...
echo ========================================

echo.
echo Root directory ignores:
svn propget svn:ignore .

echo.
echo ========================================
echo Removing already tracked files that should be ignored...
echo ========================================

REM Remove tracked files that should be ignored
svn rm --keep-local package-lock.json 2>nul
svn rm --keep-local .env 2>nul
svn rm --keep-local .env.local 2>nul
svn rm --keep-local android/local.properties 2>nul

REM Remove any .log files
for /r %%f in (*.log) do (
    svn rm --keep-local "%%f" 2>nul
)

REM Remove any .apk files
for /r %%f in (*.apk) do (
    svn rm --keep-local "%%f" 2>nul
)

echo.
echo ========================================
echo Creating .svnignore reference file...
echo ========================================

(
echo # SVN Ignore Pattern Reference
echo # Last updated: %date%
echo #
echo # This file is for reference only. 
echo # Actual ignore settings are stored in SVN properties.
echo #
echo # To view current ignore settings:
echo #   svn propget svn:ignore .
echo #
echo # To add new ignore patterns:
echo #   1. Edit this file
echo #   2. Run: svn propset svn:ignore -F .svnignore .
echo #
echo # Essential ignores for React Native project:
echo
echo # Dependencies
echo node_modules
echo package-lock.json
echo
echo # Logs
echo *.log
echo npm-debug.log*
echo yarn-error.log*
echo yarn-debug.log*
echo
echo # Environment files
echo .env
echo .env.local
echo .env.*.local
echo .env.backup
echo
echo # Metro
echo .metro-health-check*
echo .metro-cache
echo metro-cache/
echo
echo # Build outputs
echo *.apk
echo *.aab
echo *.ipa
echo *.jsbundle
echo
echo # Android specific
echo android/build
echo android/.gradle
echo android/local.properties
echo android/app/build
echo android/.cxx
echo
echo # iOS specific
echo ios/build
echo ios/Pods
echo ios/.xcode.env.local
echo
echo # IDE
echo .idea
echo .vscode
echo *.iml
echo
echo # OS
echo .DS_Store
echo Thumbs.db
echo desktop.ini
echo
echo # Temporary
echo *.tmp
echo *.temp
echo *.cache
echo temp/
echo tmp/
echo logs/
) > .svnignore

echo.
echo ========================================
echo SVN Ignore Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Review the changes: svn status
echo 2. Commit the property changes: svn commit -m "Setup comprehensive SVN ignore rules"
echo 3. The .svnignore file has been created for reference
echo.
echo To add more ignore patterns later:
echo 1. Edit .svnignore file
echo 2. Run: svn propset svn:ignore -F .svnignore .
echo.
pause
