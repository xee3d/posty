@echo off
chcp 65001 > nul
echo ========================================
echo 🔄 Posty 완전 재시작 (캐시 클리어 포함)
echo ========================================
echo.

:: 현재 디렉토리로 이동
cd /d "%~dp0"

:: Metro 번들러 및 Node 프로세스 종료
echo 1. Metro 번들러 및 Node 프로세스 종료 중...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq *Metro*" 2>nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq *react-native*" 2>nul
timeout /t 2 >nul

:: 앱 종료
echo 2. Android 앱 종료 중...
adb shell am force-stop com.posty 2>nul
timeout /t 1 >nul

:: 캐시 클리어
echo 3. 캐시 클리어 중...
call npx react-native start --reset-cache --port 8081 --experimental-debugger &
timeout /t 5 >nul

:: .env 파일 재로드를 위한 node_modules 캐시 클리어
echo 4. dotenv 캐시 클리어 중...
rd /s /q "%TEMP%\metro-cache" 2>nul
rd /s /q "%TEMP%\haste-map-*" 2>nul

:: Android 빌드 캐시 클리어 (선택적)
echo 5. Android 빌드 캐시 클리어 중...
cd android
call gradlew clean 2>nul
cd ..

:: 앱 재시작
echo 6. Android 앱 재시작 중...
call npx react-native run-android --no-packager

echo.
echo ✅ 완전 재시작 완료!
echo.
echo 📌 .env 파일 변경사항이 적용되었습니다.
echo.
pause
