@echo off
echo ========================================
echo  Android 키 해시 확인
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\android

echo Debug 키 해시 (네이버용 SHA-1):
echo --------------------------------
keytool -list -v -keystore app\debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1

echo.
echo Debug 키 해시 (카카오용 Base64):
echo --------------------------------
keytool -exportcert -alias androiddebugkey -keystore app\debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64

echo.
echo ========================================
echo  위 값들을 복사하여 사용하세요:
echo  - 네이버: SHA-1 값
echo  - 카카오: Base64 값
echo ========================================
echo.
pause