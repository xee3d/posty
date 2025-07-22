@echo off
echo ========================================
echo  Android Key Hash 확인
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\android

echo 1. 네이버용 SHA-1:
echo ------------------
keytool -list -v -keystore app\debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1

echo.
echo 2. 카카오용 Base64:
echo -------------------
keytool -exportcert -alias androiddebugkey -keystore app\debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64

echo.
echo ========================================
echo 위 값들을 각 개발자 센터에 등록하세요
echo ========================================
echo.
pause