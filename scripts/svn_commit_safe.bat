@echo off
echo ========================================
echo SVN 커밋 전 제외 파일 확인
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo 제외되어야 할 파일/폴더 확인 중...
echo ----------------------------------------

REM 제외할 항목들 확인
if exist "node_modules\" (
    echo [발견] node_modules\ - 제외 필요
    svn propset svn:ignore "node_modules" .
)

if exist "android\build\" (
    echo [발견] android\build\ - 제외 필요
    cd android
    svn propset svn:ignore "build" .
    cd ..
)

if exist "android\app\build\" (
    echo [발견] android\app\build\ - 제외 필요
    cd android\app
    svn propset svn:ignore "build" .
    cd ..\..
)

if exist "android\.gradle\" (
    echo [발견] android\.gradle\ - 제외 필요
    cd android
    svn propset svn:ignore ".gradle" .
    cd ..
)

if exist "android\local.properties" (
    echo [발견] android\local.properties - 제외 필요
    cd android
    svn propset svn:ignore "local.properties" .
    cd ..
)

if exist ".env" (
    echo [발견] .env - 이미 버전 관리 중인지 확인
    svn status .env
)

echo.
echo ========================================
echo SVN 상태 확인 (제외 파일 포함)
echo ========================================
svn status --no-ignore

echo.
echo ========================================
echo 제외되지 않은 파일 중 커밋할 파일 확인
echo ========================================
svn status

echo.
echo 계속하려면 아무 키나 누르세요...
pause

echo.
echo ========================================
echo 새 파일 추가 (제외 파일 무시)
echo ========================================
REM 특정 파일/폴더를 제외하고 추가
for /f "tokens=2" %%i in ('svn status ^| findstr "^?"') do (
    echo %%i | findstr /v "node_modules" | findstr /v "build" | findstr /v ".gradle" | findstr /v "local.properties" | findstr /v ".log" | findstr /v ".tmp" | findstr /v ".apk" | findstr /v ".aab" >nul
    if not errorlevel 1 (
        echo 추가: %%i
        svn add "%%i"
    )
)

echo.
echo ========================================
echo 최종 커밋 상태 확인
echo ========================================
svn status

echo.
echo ========================================
echo 커밋 준비 완료
echo ========================================
echo.
echo 커밋 메시지: "React Native 0.74.5 업그레이드 완료 - 2025년 7월 11일"
echo.
echo 정말로 커밋하시겠습니까? (Ctrl+C로 취소 가능)
pause

svn commit -m "React Native 0.74.5 업그레이드 완료 - 2025년 7월 11일"

echo.
echo ========================================
echo SVN 커밋 완료!
echo ========================================
pause
