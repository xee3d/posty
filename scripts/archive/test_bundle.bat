@echo off
echo ========================================
echo Test Bundle Generation
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Generating Android bundle manually...
npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

if exist android\app\src\main\assets\index.android.bundle (
    echo.
    echo SUCCESS: Bundle generated!
    echo Size:
    for %%A in (android\app\src\main\assets\index.android.bundle) do echo %%~zA bytes
    
    echo.
    echo [2] Installing app with prebuilt bundle...
    cd android
    call gradlew installDebug
    cd ..
    
    echo.
    echo [3] Starting app...
    adb shell am start -n com.posty/.MainActivity
) else (
    echo.
    echo ERROR: Bundle generation failed!
)

pause