@echo off
echo ========================================
echo SVN 제외 파일 상세 점검
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1/4] 대용량 폴더 확인...
echo ----------------------------------------
if exist "node_modules\" (
    echo [!] node_modules\ 폴더 발견 - 반드시 제외 필요!
    for /f %%i in ('dir /s /b "node_modules" 2^>nul ^| find /c /v ""') do echo     파일 수: %%i개
)

echo.
echo [2/4] 빌드 관련 폴더 확인...
echo ----------------------------------------
if exist "android\build\" echo [!] android\build\ 발견
if exist "android\app\build\" echo [!] android\app\build\ 발견
if exist "android\.gradle\" echo [!] android\.gradle\ 발견
if exist "ios\build\" echo [!] ios\build\ 발견
if exist "ios\Pods\" echo [!] ios\Pods\ 발견

echo.
echo [3/4] 민감한 파일 확인...
echo ----------------------------------------
if exist ".env" echo [?] .env 파일 발견 - 확인 필요
if exist ".env.local" echo [!] .env.local 발견 - 제외 필요
if exist "android\local.properties" echo [!] android\local.properties 발견 - 제외 필요

for %%f in (*.keystore *.jks *.pem *.p12) do (
    if exist "%%f" (
        if "%%f"=="debug.keystore" (
            echo [OK] %%f - 디버그 키스토어는 허용
        ) else (
            echo [!!!] %%f 발견 - 보안 파일, 절대 커밋 금지!
        )
    )
)

echo.
echo [4/4] 임시 파일 확인...
echo ----------------------------------------
for %%e in (log tmp temp cache apk aab) do (
    for /f "delims=" %%f in ('dir /s /b *.%%e 2^>nul') do (
        echo [!] %%f
    )
)

echo.
echo ========================================
echo SVN 현재 ignore 설정 확인
echo ========================================
echo.
echo 루트 디렉토리:
svn propget svn:ignore .
echo.
echo android 디렉토리:
svn propget svn:ignore android
echo.
echo android\app 디렉토리:
svn propget svn:ignore android\app

echo.
echo ========================================
echo 권장 작업
echo ========================================
echo.
echo 1. 위에서 [!] 또는 [!!!] 표시된 항목은 제외 필요
echo 2. [?] 표시된 항목은 내용 확인 후 결정
echo 3. svn_commit_safe.bat 실행 전 이 스크립트 실행 권장
echo.
pause
