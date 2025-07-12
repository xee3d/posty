@echo off
chcp 949
echo ========================================
echo Verify Firebase Android Configuration
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Checking Android configuration files...
echo ========================================

echo.
echo 1. Checking google-services.json...
if exist "android\app\google-services.json" (
    echo [OK] google-services.json found
) else (
    echo [ERROR] google-services.json NOT FOUND!
    echo Please download from Firebase Console and place in android/app/
)

echo.
echo 2. Checking android/build.gradle...
findstr /C:"com.google.gms:google-services" android\build.gradle >nul
if %errorlevel%==0 (
    echo [OK] Google services classpath found
) else (
    echo [WARNING] Google services classpath not found
    echo Add to android/build.gradle dependencies:
    echo classpath("com.google.gms:google-services:4.4.2")
)

echo.
echo 3. Checking android/app/build.gradle...
findstr /C:"com.google.gms.google-services" android\app\build.gradle >nul
if %errorlevel%==0 (
    echo [OK] Google services plugin applied
) else (
    echo [WARNING] Google services plugin not applied
    echo Add to android/app/build.gradle:
    echo apply plugin: "com.google.gms.google-services"
)

echo.
echo 4. Checking Firebase BOM...
findstr /C:"firebase-bom" android\app\build.gradle >nul
if %errorlevel%==0 (
    echo [OK] Firebase BOM found
) else (
    echo [INFO] Firebase BOM not found (optional but recommended)
    echo Add to android/app/build.gradle dependencies:
    echo implementation platform('com.google.firebase:firebase-bom:33.6.0')
)

echo.
echo 5. Checking minSdkVersion...
findstr /C:"minSdkVersion = 23" android\build.gradle >nul
if %errorlevel%==0 (
    echo [OK] minSdkVersion is 23 or higher
) else (
    echo [WARNING] Check minSdkVersion (must be 23 or higher for Firebase)
)

echo.
echo ========================================
echo Configuration check complete!
echo ========================================
pause
