@echo off
chcp 949
echo ========================================
echo SVN Exclude Files Check
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1/4] Checking large folders...
echo ----------------------------------------
if exist "node_modules\" (
    echo [!] node_modules\ folder found - MUST exclude!
    for /f %%i in ('dir /s /b "node_modules" 2^>nul ^| find /c /v ""') do echo     File count: %%i files
)

echo.
echo [2/4] Checking build folders...
echo ----------------------------------------
if exist "android\build\" echo [!] android\build\ found
if exist "android\app\build\" echo [!] android\app\build\ found
if exist "android\.gradle\" echo [!] android\.gradle\ found
if exist "ios\build\" echo [!] ios\build\ found
if exist "ios\Pods\" echo [!] ios\Pods\ found

echo.
echo [3/4] Checking sensitive files...
echo ----------------------------------------
if exist ".env" echo [?] .env file found - check required
if exist ".env.local" echo [!] .env.local found - need to exclude
if exist "android\local.properties" echo [!] android\local.properties found - need to exclude

for %%f in (*.keystore *.jks *.pem *.p12) do (
    if exist "%%f" (
        if "%%f"=="debug.keystore" (
            echo [OK] %%f - debug keystore is allowed
        ) else (
            echo [!!!] %%f found - security file, NEVER commit!
        )
    )
)

echo.
echo [4/4] Checking temporary files...
echo ----------------------------------------
for %%e in (log tmp temp cache apk aab) do (
    for /f "delims=" %%f in ('dir /s /b *.%%e 2^>nul') do (
        echo [!] %%f
    )
)

echo.
echo ========================================
echo Current SVN ignore settings
echo ========================================
echo.
echo Root directory:
svn propget svn:ignore .
echo.
echo android directory:
svn propget svn:ignore android
echo.
echo android\app directory:
svn propget svn:ignore android\app

echo.
echo ========================================
echo Recommendations
echo ========================================
echo.
echo 1. Items marked with [!] or [!!!] need to be excluded
echo 2. Items marked with [?] need review
echo 3. Run this script before svn_commit_safe_en.bat
echo.
pause
