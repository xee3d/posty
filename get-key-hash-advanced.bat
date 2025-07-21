@echo off
echo ========================================
echo  Android 키 해시 확인 도구
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\android

echo OpenSSL이 설치되어 있는지 확인 중...
where openssl >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [오류] OpenSSL이 설치되어 있지 않습니다!
    echo.
    echo OpenSSL 다운로드:
    echo https://slproweb.com/download/Win64OpenSSL_Light-3_3_0.exe
    echo.
    echo 설치 후 시스템 PATH에 추가하세요:
    echo C:\Program Files\OpenSSL-Win64\bin
    echo.
    pause
    exit /b 1
)

echo OpenSSL 발견: OK
echo.

echo ========================================
echo  1. 네이버용 SHA-1 해시
echo ========================================
keytool -list -v -keystore app\debug.keystore -alias androiddebugkey -storepass android -keypass android 2>nul | findstr SHA1

echo.
echo ========================================
echo  2. 카카오용 Base64 해시
echo ========================================
for /f "delims=" %%i in ('keytool -exportcert -alias androiddebugkey -keystore app\debug.keystore -storepass android -keypass android 2^>nul ^| openssl sha1 -binary ^| openssl base64') do set KAKAO_HASH=%%i
echo %KAKAO_HASH%

echo.
echo ========================================
echo  3. 전체 인증서 정보
echo ========================================
keytool -list -v -keystore app\debug.keystore -alias androiddebugkey -storepass android -keypass android 2>nul | findstr "Owner SHA1 SHA256 MD5"

echo.
echo ========================================
echo  사용 방법:
echo ========================================
echo.
echo 네이버: SHA1 값을 그대로 복사
echo 예) AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
echo.
echo 카카오: Base64 값을 그대로 복사  
echo 예) Xo8WBi6jzSxKDVR4drqm84yr9iU=
echo.
echo ========================================
echo.

echo 클립보드에 복사하시겠습니까?
echo 1. 네이버 SHA-1 복사
echo 2. 카카오 Base64 복사
echo 3. 종료
echo.
set /p choice="선택 (1-3): "

if "%choice%"=="1" (
    keytool -list -v -keystore app\debug.keystore -alias androiddebugkey -storepass android -keypass android 2>nul | findstr SHA1 | clip
    echo SHA-1 값이 클립보드에 복사되었습니다!
) else if "%choice%"=="2" (
    echo %KAKAO_HASH% | clip
    echo 카카오 해시가 클립보드에 복사되었습니다!
)

echo.
pause