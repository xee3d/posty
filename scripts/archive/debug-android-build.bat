@echo off
chcp 65001 > nul
echo 상세한 Android 빌드 디버깅 시작...
echo =====================================
echo.

echo [1/5] 환경 변수 확인...
echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%
echo PATH에 platform-tools 포함 여부 확인...
echo %PATH% | findstr /i "platform-tools" > nul
if %errorlevel% == 0 (
    echo ✓ platform-tools가 PATH에 포함되어 있습니다.
) else (
    echo ✗ platform-tools가 PATH에 없습니다!
)
echo.

echo [2/5] Java 버전 확인...
java -version 2>&1
echo.
javac -version 2>&1
echo.

echo [3/5] 연결된 장치 확인...
adb devices
echo.

echo [4/5] React Native Doctor 실행...
call npx react-native doctor
echo.

echo [5/5] 상세한 Gradle 빌드 시작 (로그는 build-debug-log.txt에 저장)...
cd android
call gradlew.bat app:installDebug --info --debug --stacktrace > ../build-debug-log.txt 2>&1
set BUILD_RESULT=%errorlevel%
cd ..

if %BUILD_RESULT% neq 0 (
    echo.
    echo ✗ 빌드 실패! 
    echo 주요 에러 메시지 추출 중...
    echo =====================================
    findstr /i "error:" build-debug-log.txt
    findstr /i "failed" build-debug-log.txt
    findstr /i "exception" build-debug-log.txt
    echo =====================================
    echo.
    echo 전체 로그는 build-debug-log.txt 파일을 확인하세요.
) else (
    echo ✓ 빌드 성공!
)

pause