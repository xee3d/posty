@echo off
echo ========================================
echo SVN 태그 생성
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo SVN 정보 확인:
svn info

echo.
echo ========================================
echo 태그 생성 준비
echo ========================================
echo.
echo 태그명: RN_0.74.5_upgrade_20250711
echo.
echo 현재 리포지토리 URL에서 태그를 생성합니다.
echo 계속하려면 아무 키나 누르세요...
pause

for /f "tokens=2" %%i in ('svn info ^| find "URL:"') do set REPO_URL=%%i
for %%i in ("%REPO_URL%") do set PARENT_URL=%%~dpi
set PARENT_URL=%PARENT_URL:~0,-1%

echo.
echo 태그 생성 중...
svn copy "%REPO_URL%" "%PARENT_URL%/tags/RN_0.74.5_upgrade_20250711" -m "React Native 0.74.5 업그레이드 태그 - 2025년 7월 11일"

echo.
echo ========================================
echo SVN 태그 생성 완료!
echo ========================================
pause
