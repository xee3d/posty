@echo off
chcp 65001 > nul
echo ╔══════════════════════════════════════════╗
echo ║    Posty 완전 클린 빌드 & QR 생성기     ║
echo ╚══════════════════════════════════════════╝
echo.

:MENU
echo 작업을 선택하세요:
echo [1] 완전 클린 빌드 (Deep Clean + Build)
echo [2] QR 코드 생성기 실행
echo [3] 클린 빌드 후 QR 생성
echo [4] 환경 진단
echo [5] 종료
echo.
set /p choice="선택 (1-5): "

if "%choice%"=="1" goto CLEAN_BUILD
if "%choice%"=="2" goto QR_GENERATOR
if "%choice%"=="3" goto CLEAN_AND_QR
if "%choice%"=="4" goto DIAGNOSE
if "%choice%"=="5" goto END
goto MENU

:CLEAN_BUILD
echo.
echo [단계 1/6] Android 빌드 캐시 정리...
cd android
call gradlew clean
call gradlew --stop
if exist .gradle rd /s /q .gradle
if exist app\build rd /s /q app\build
cd ..

echo.
echo [단계 2/6] Metro 캐시 정리...
if exist "%TEMP%\metro-cache" rd /s /q "%TEMP%\metro-cache"
if exist "%TEMP%\react-native-*" del /q "%TEMP%\react-native-*"
if exist "%LOCALAPPDATA%\react-native" rd /s /q "%LOCALAPPDATA%\react-native"

echo.
echo [단계 3/6] Watchman 캐시 정리 (있는 경우)...
where watchman >nul 2>nul
if %errorlevel% == 0 (
    watchman watch-del-all
)

echo.
echo [단계 4/6] 패키지 재설치 확인...
echo 패키지가 최신 상태인지 확인 중...
call npm install

echo.
echo [단계 5/6] Metro 번들러 시작 (별도 창)...
start "Metro Server" cmd /k "npx react-native start --reset-cache"
timeout /t 5 /nobreak > nul

echo.
echo [단계 6/6] Android 앱 빌드 및 설치...
call npx react-native run-android

if %errorlevel% neq 0 (
    echo.
    echo ✗ 빌드 실패! debug-android-build.bat를 실행하여 자세한 정보를 확인하세요.
) else (
    echo.
    echo ✓ 빌드 성공!
)
echo.
pause
goto MENU

:QR_GENERATOR
echo.
echo QR 코드 생성기 실행 중...
if exist "generate-qr.py" (
    python generate-qr.py
    if %errorlevel% neq 0 (
        echo.
        echo ✗ Python 실행 에러 발생!
        echo Python이 설치되어 있는지 확인하세요.
        echo 또는 필요한 라이브러리를 설치하세요:
        echo pip install qrcode pillow
    )
) else (
    echo ✗ generate-qr.py 파일을 찾을 수 없습니다!
)
echo.
pause
goto MENU

:CLEAN_AND_QR
call :CLEAN_BUILD
call :QR_GENERATOR
goto MENU

:DIAGNOSE
echo.
echo 시스템 진단 중...
echo =====================================
echo.
call check-android-env.bat
echo.
pause
goto MENU

:END
echo.
echo 종료합니다...
exit /b