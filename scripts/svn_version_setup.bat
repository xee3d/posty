@echo off
echo ========================================
echo Posty V74 SVN 관리 스크립트
echo React Native 0.74.5 버전
echo ========================================
echo.
echo 1. 새 브랜치로 전환 (권장)
echo 2. 로컬 저장소 생성
echo 3. 별도 프로젝트로 생성
echo 4. 현재 상태 확인만
echo 5. 종료
echo.
set /p choice="선택하세요 (1-5): "

if "%choice%"=="1" goto BRANCH
if "%choice%"=="2" goto LOCAL
if "%choice%"=="3" goto SEPARATE
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto END

:BRANCH
echo.
echo === 브랜치 생성 및 전환 ===
cd /d C:\Users\xee3d\Documents\Posty_V74
svn copy https://ethanchoi/Posty/trunk https://ethanchoi/Posty/branches/v074 -m "React Native 0.74.5 브랜치"
svn switch https://ethanchoi/Posty/branches/v074
svn add * --force
svn commit -m "React Native 0.74.5 업그레이드 완료"
echo 브랜치 전환 완료!
goto END

:LOCAL
echo.
echo === 로컬 저장소 생성 ===
svnadmin create D:\SVN\Posty_V074_Repo
cd /d C:\Users\xee3d\Documents\Posty_V74
svn import . file:///D:/SVN/Posty_V074_Repo/trunk -m "RN 0.74.5 초기 import"
echo 로컬 저장소 생성 완료!
echo 다음 명령으로 체크아웃하세요:
echo svn checkout file:///D:/SVN/Posty_V074_Repo/trunk Posty_V74_new
goto END

:SEPARATE
echo.
echo === 별도 프로젝트 생성 ===
cd /d C:\Users\xee3d\Documents\Posty_V74
echo 주의: .svn 폴더를 삭제하고 새로 import합니다.
set /p confirm="계속하시겠습니까? (y/n): "
if /i "%confirm%"=="y" (
    rmdir /s /q .svn
    svn import . https://ethanchoi/Posty_V074/trunk -m "React Native 0.74.5 새 프로젝트"
    echo 별도 프로젝트 생성 완료!
)
goto END

:STATUS
echo.
echo === 현재 SVN 상태 ===
cd /d C:\Users\xee3d\Documents\Posty_V74
svn info
echo.
svn status
goto END

:END
echo.
pause
