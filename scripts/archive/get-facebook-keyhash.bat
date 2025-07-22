@echo off
echo Getting Facebook Key Hash from device...

adb shell "run-as com.posty cat /data/data/com.posty/shared_prefs/com.facebook.sdk.applicationId.xml 2>nul"

echo.
echo Getting key hash from logcat...
adb logcat -d | findstr "KeyHash"

echo.
echo Generating debug key hash...
keytool -exportcert -alias androiddebugkey -keystore android/app/debug.keystore -storepass android | openssl sha1 -binary | openssl base64

pause
