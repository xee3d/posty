@echo off
chcp 65001 > nul
echo ========================================
echo Subscription System Package Installation
echo ========================================
echo.

echo [1/2] Installing React Native IAP...
call npm install react-native-iap@latest
if %errorlevel% neq 0 (
    echo X React Native IAP installation failed
    goto :error
) else (
    echo O React Native IAP installed successfully
)
echo.

echo [2/2] Checking Device Info...
call npm list react-native-device-info > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Device Info...
    call npm install react-native-device-info@latest
    echo O Device Info installed successfully
) else (
    echo O Device Info already installed
)
echo.

echo ========================================
echo iOS Setup (Mac only)
echo ========================================
echo.
echo If you are using iOS, run:
echo cd ios && pod install && cd ..
echo.

echo ========================================
echo Next Steps
echo ========================================
echo.
echo 1. Register In-App products in App Store Connect:
echo    - com.posty.premium.monthly
echo    - com.posty.premium.yearly
echo    - com.posty.pro.monthly
echo    - com.posty.pro.yearly
echo.
echo 2. Register subscriptions in Google Play Console:
echo    - premium_monthly
echo    - premium_yearly  
echo    - pro_monthly
echo    - pro_yearly
echo.
echo 3. Add to .env file:
echo    API_URL=https://api.posty.ai
echo    IOS_SHARED_SECRET=your-ios-shared-secret
echo.
echo 4. Implement server API endpoints:
echo    - /api/subscriptions/*
echo.
echo See GLOBAL_SUBSCRIPTION_GUIDE.md for details
echo.
pause
exit /b 0

:error
echo.
echo X Installation failed with errors
echo.
pause
exit /b 1