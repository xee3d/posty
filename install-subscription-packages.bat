@echo off
echo ========================================
echo 구독 시스템 패키지 설치
echo ========================================
echo.

echo [1/2] React Native IAP 설치 중...
call npm install react-native-iap@latest
if %errorlevel% neq 0 (
    echo ❌ React Native IAP 설치 실패
    goto :error
) else (
    echo ✅ React Native IAP 설치 완료
)
echo.

echo [2/2] Device Info 설치 중... (이미 설치됨)
call npm list react-native-device-info
if %errorlevel% neq 0 (
    call npm install react-native-device-info@latest
    echo ✅ Device Info 설치 완료
) else (
    echo ✅ Device Info 이미 설치됨
)
echo.

echo ========================================
echo iOS 설정 (Mac에서만)
echo ========================================
echo.
echo iOS를 사용 중이라면 다음 명령을 실행하세요:
echo cd ios && pod install && cd ..
echo.

echo ========================================
echo 다음 단계
echo ========================================
echo.
echo 1. App Store Connect에서 인앱 상품 등록
echo    - com.posty.premium.monthly
echo    - com.posty.premium.yearly
echo    - com.posty.pro.monthly
echo    - com.posty.pro.yearly
echo.
echo 2. Google Play Console에서 구독 상품 등록
echo    - premium_monthly
echo    - premium_yearly  
echo    - pro_monthly
echo    - pro_yearly
echo.
echo 3. .env 파일에 다음 추가:
echo    API_URL=https://api.posty.ai
echo    IOS_SHARED_SECRET=your-ios-shared-secret
echo.
echo 4. 서버 API 구현 필요
echo    - /api/subscriptions/* 엔드포인트
echo.
echo 자세한 내용은 GLOBAL_SUBSCRIPTION_GUIDE.md 참고
echo.
pause
exit /b 0

:error
echo.
echo ❌ 설치 중 오류가 발생했습니다.
echo.
pause
exit /b 1
