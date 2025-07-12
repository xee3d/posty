@echo off
chcp 949
echo ========================================
echo Firebase Setup for React Native 0.74.5
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Step 1: Installing Firebase packages...
echo ========================================
npm install @react-native-firebase/app@20.4.0 @react-native-firebase/auth@20.4.0 @react-native-firebase/firestore@20.4.0 --save --save-exact

echo.
echo Step 2: Activating Firebase in Android config...
echo ========================================

REM Activate Firebase in android/build.gradle
echo Updating android/build.gradle...
powershell -Command "(Get-Content 'android\build.gradle') -replace '// classpath\(\"com.google.gms:google-services:4.4.2\"\)', 'classpath(\"com.google.gms:google-services:4.4.2\")' | Set-Content 'android\build.gradle'"

REM Activate Firebase in android/app/build.gradle
echo Updating android/app/build.gradle...
powershell -Command "(Get-Content 'android\app\build.gradle') -replace '// apply plugin: \"com.google.gms.google-services\"', 'apply plugin: \"com.google.gms.google-services\"' | Set-Content 'android\app\build.gradle'"
powershell -Command "(Get-Content 'android\app\build.gradle') -replace '// implementation platform\(''com.google.firebase:firebase-bom:33.6.0''\)', 'implementation platform(''com.google.firebase:firebase-bom:33.6.0'')' | Set-Content 'android\app\build.gradle'"

echo.
echo Step 3: Checking for google-services.json...
echo ========================================
if exist "android\app\google-services.json" (
    echo [OK] google-services.json found!
) else (
    echo [WARNING] google-services.json NOT FOUND!
    echo.
    echo Please download google-services.json from Firebase Console:
    echo 1. Go to https://console.firebase.google.com
    echo 2. Select your project
    echo 3. Click the gear icon → Project settings
    echo 4. Scroll down to "Your apps" → Android app
    echo 5. Download google-services.json
    echo 6. Place it in: android\app\
    echo.
)

echo.
echo Step 4: Re-enabling Firebase test in code...
echo ========================================
powershell -Command "(Get-Content 'src\screens\SettingsScreen.tsx') -replace '// import FirebaseAuthTest from ''./FirebaseAuthTest''; // Temporarily disabled until Firebase is installed', 'import FirebaseAuthTest from ''./FirebaseAuthTest'';' | Set-Content 'src\screens\SettingsScreen.tsx'"
powershell -Command "(Get-Content 'src\screens\SettingsScreen.tsx') -replace 'Alert.alert\([^}]+\};\s*return null;', 'return ^<FirebaseAuthTest onBack={() =^> setShowFirebaseTest(false)} /^>;' | Set-Content 'src\screens\SettingsScreen.tsx'"

echo.
echo Step 5: Clean and rebuild...
echo ========================================
cd android
call gradlew clean
cd ..

echo.
echo ========================================
echo Firebase setup complete!
echo ========================================
echo.
echo Next: Run 'npx react-native run-android'
echo.
pause
