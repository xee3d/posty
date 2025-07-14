@echo off
echo Starting Posty Development Environment...
echo.

REM Metro 서버 시작
echo [1/2] Starting Metro bundler...
start cmd /k "npx react-native start"

REM 3초 대기
timeout /t 3 /nobreak > nul

REM Android 앱 실행
echo [2/2] Running Android app...
npx react-native run-android

echo.
echo Development environment is ready!
pause
