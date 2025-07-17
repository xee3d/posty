@echo off
echo ===================================
echo Generating SHA-1 for Debug Key
echo ===================================
echo.

echo Checking for debug.keystore in multiple locations...
echo.

if exist "C:\Users\xee3d\.android\debug.keystore" (
    echo Found debug.keystore in .android folder
    cd /d C:\Users\xee3d\.android
    keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1
) else if exist "%USERPROFILE%\.android\debug.keystore" (
    echo Found debug.keystore in USERPROFILE
    cd /d %USERPROFILE%\.android
    keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1
) else if exist "C:\Users\xee3d\Documents\Posty_V74\android\app\debug.keystore" (
    echo Found debug.keystore in project folder
    cd /d C:\Users\xee3d\Documents\Posty_V74\android\app
    keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1
) else (
    echo ERROR: debug.keystore not found!
    echo.
    echo Creating new debug.keystore...
    if not exist "C:\Users\xee3d\.android" mkdir "C:\Users\xee3d\.android"
    cd /d C:\Users\xee3d\.android
    keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    echo.
    echo New keystore created. Running SHA1 generation...
    keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1
)

echo.
echo ===================================
echo Copy the SHA1 value above
echo ===================================
echo.
echo Full fingerprint:
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android 2>nul | findstr "SHA1 SHA256 MD5"
echo.
pause
