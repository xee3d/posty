@echo off
chcp 65001 > nul
echo ╔══════════════════════════════════════════╗
echo ║      Android 빌드 문제 자동 해결기       ║
echo ╚══════════════════════════════════════════╝
echo.

echo [1/7] google-services.json 파일 확인...
if exist "android\app\google-services.json" (
    echo ✓ google-services.json 파일이 존재합니다.
) else (
    echo ✗ google-services.json 파일이 없습니다!
    echo Firebase 콘솔에서 다운로드하여 android/app/ 폴더에 넣어주세요.
)
echo.

echo [2/7] Gradle 데몬 중지...
cd android
call gradlew --stop
cd ..
echo.

echo [3/7] 임시 파일 및 캐시 정리...
if exist "%USERPROFILE%\.gradle\caches" (
    echo Gradle 캐시 정리 중...
    rd /s /q "%USERPROFILE%\.gradle\caches\build-cache-*" 2>nul
)
if exist "android\.gradle" rd /s /q "android\.gradle"
if exist "android\app\build" rd /s /q "android\app\build"
echo.

echo [4/7] Android 라이센스 자동 수락...
echo y | "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" --licenses 2>nul
echo.

echo [5/7] SDK Build Tools 확인 및 설치...
"%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;34.0.0" "platforms;android-34"
echo.

echo [6/7] 프로젝트 종속성 새로고침...
cd android
call gradlew clean
call gradlew dependencies --refresh-dependencies
cd ..
echo.

echo [7/7] 빌드 재시도...
call npx react-native run-android

if %errorlevel% neq 0 (
    echo.
    echo ======================================
    echo 여전히 빌드가 실패한다면:
    echo 1. Android Studio를 열고 'File' → 'Sync Project with Gradle Files' 실행
    echo 2. JDK 버전 확인 (JDK 17 권장)
    echo 3. 환경 변수 확인:
    echo    - JAVA_HOME이 JDK 경로를 가리키는지
    echo    - ANDROID_HOME이 Android SDK 경로를 가리키는지
    echo 4. debug-android-build.bat 실행하여 상세 로그 확인
    echo ======================================
)

pause