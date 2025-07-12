@echo off
echo ========================================
echo 소셜 로그인 패키지 설치 시작
echo ========================================
echo.

echo [1/3] Google Sign-In 설치 중...
call npm install @react-native-google-signin/google-signin@latest
if %errorlevel% neq 0 (
    echo ❌ Google Sign-In 설치 실패
) else (
    echo ✅ Google Sign-In 설치 완료
)
echo.

echo [2/3] Naver Login 설치 중...
call npm install @react-native-seoul/naver-login@latest
if %errorlevel% neq 0 (
    echo ❌ Naver Login 설치 실패
) else (
    echo ✅ Naver Login 설치 완료
)
echo.

echo [3/3] Kakao Login 설치 중...
call npm install @react-native-seoul/kakao-login@latest
if %errorlevel% neq 0 (
    echo ❌ Kakao Login 설치 실패
) else (
    echo ✅ Kakao Login 설치 완료
)
echo.

echo ========================================
echo 설치 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. .env 파일에 API 키 설정
echo 2. Android 네이티브 설정 (AndroidManifest.xml, build.gradle)
echo 3. 앱 재빌드: npx react-native run-android
echo.
echo 자세한 내용은 SOCIAL_LOGIN_SETUP.md 참고
echo.
pause
