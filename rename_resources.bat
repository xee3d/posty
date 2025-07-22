@echo off
chcp 65001 > nul
cd C:\Users\xee3d\Documents\Posty

echo 리소스 파일 이름 변경 중...

rem mipmap-hdpi 폴더
if exist "android\app\src\main\res\mipmap-hdpi\posty.png" (
    ren "android\app\src\main\res\mipmap-hdpi\posty.png" "ic_launcher.png"
)
if exist "android\app\src\main\res\mipmap-hdpi\Posty_background.png" (
    ren "android\app\src\main\res\mipmap-hdpi\Posty_background.png" "ic_launcher_background.png"
)
if exist "android\app\src\main\res\mipmap-hdpi\Posty_foreground.png" (
    ren "android\app\src\main\res\mipmap-hdpi\Posty_foreground.png" "ic_launcher_foreground.png"
)
if exist "android\app\src\main\res\mipmap-hdpi\Posty_monochrome.png" (
    ren "android\app\src\main\res\mipmap-hdpi\Posty_monochrome.png" "ic_launcher_monochrome.png"
)

rem mipmap-mdpi 폴더
if exist "android\app\src\main\res\mipmap-mdpi\posty.png" (
    ren "android\app\src\main\res\mipmap-mdpi\posty.png" "ic_launcher.png"
)
if exist "android\app\src\main\res\mipmap-mdpi\Posty_background.png" (
    ren "android\app\src\main\res\mipmap-mdpi\Posty_background.png" "ic_launcher_background.png"
)
if exist "android\app\src\main\res\mipmap-mdpi\Posty_foreground.png" (
    ren "android\app\src\main\res\mipmap-mdpi\Posty_foreground.png" "ic_launcher_foreground.png"
)
if exist "android\app\src\main\res\mipmap-mdpi\Posty_monochrome.png" (
    ren "android\app\src\main\res\mipmap-mdpi\Posty_monochrome.png" "ic_launcher_monochrome.png"
)

rem mipmap-xhdpi 폴더
if exist "android\app\src\main\res\mipmap-xhdpi\posty.png" (
    ren "android\app\src\main\res\mipmap-xhdpi\posty.png" "ic_launcher.png"
)
if exist "android\app\src\main\res\mipmap-xhdpi\Posty_background.png" (
    ren "android\app\src\main\res\mipmap-xhdpi\Posty_background.png" "ic_launcher_background.png"
)
if exist "android\app\src\main\res\mipmap-xhdpi\Posty_foreground.png" (
    ren "android\app\src\main\res\mipmap-xhdpi\Posty_foreground.png" "ic_launcher_foreground.png"
)
if exist "android\app\src\main\res\mipmap-xhdpi\Posty_monochrome.png" (
    ren "android\app\src\main\res\mipmap-xhdpi\Posty_monochrome.png" "ic_launcher_monochrome.png"
)

rem mipmap-xxhdpi 폴더
if exist "android\app\src\main\res\mipmap-xxhdpi\posty.png" (
    ren "android\app\src\main\res\mipmap-xxhdpi\posty.png" "ic_launcher.png"
)
if exist "android\app\src\main\res\mipmap-xxhdpi\Posty_background.png" (
    ren "android\app\src\main\res\mipmap-xxhdpi\Posty_background.png" "ic_launcher_background.png"
)
if exist "android\app\src\main\res\mipmap-xxhdpi\Posty_foreground.png" (
    ren "android\app\src\main\res\mipmap-xxhdpi\Posty_foreground.png" "ic_launcher_foreground.png"
)
if exist "android\app\src\main\res\mipmap-xxhdpi\Posty_monochrome.png" (
    ren "android\app\src\main\res\mipmap-xxhdpi\Posty_monochrome.png" "ic_launcher_monochrome.png"
)

rem mipmap-xxxhdpi 폴더
if exist "android\app\src\main\res\mipmap-xxxhdpi\posty.png" (
    ren "android\app\src\main\res\mipmap-xxxhdpi\posty.png" "ic_launcher.png"
)
if exist "android\app\src\main\res\mipmap-xxxhdpi\Posty_background.png" (
    ren "android\app\src\main\res\mipmap-xxxhdpi\Posty_background.png" "ic_launcher_background.png"
)
if exist "android\app\src\main\res\mipmap-xxxhdpi\Posty_foreground.png" (
    ren "android\app\src\main\res\mipmap-xxxhdpi\Posty_foreground.png" "ic_launcher_foreground.png"
)
if exist "android\app\src\main\res\mipmap-xxxhdpi\Posty_monochrome.png" (
    ren "android\app\src\main\res\mipmap-xxxhdpi\Posty_monochrome.png" "ic_launcher_monochrome.png"
)

rem mipmap-anydpi-v26 폴더
if exist "android\app\src\main\res\mipmap-anydpi-v26\posty.xml" (
    ren "android\app\src\main\res\mipmap-anydpi-v26\posty.xml" "ic_launcher.xml"
)

rem ic_launcher_round 파일 생성 (복사)
if exist "android\app\src\main\res\mipmap-hdpi\ic_launcher.png" (
    copy "android\app\src\main\res\mipmap-hdpi\ic_launcher.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png" > nul
)
if exist "android\app\src\main\res\mipmap-mdpi\ic_launcher.png" (
    copy "android\app\src\main\res\mipmap-mdpi\ic_launcher.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png" > nul
)
if exist "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png" (
    copy "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png" > nul
)
if exist "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png" (
    copy "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png" > nul
)
if exist "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" (
    copy "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png" > nul
)
if exist "android\app\src\main\res\mipmap-anydpi-v26\ic_launcher.xml" (
    copy "android\app\src\main\res\mipmap-anydpi-v26\ic_launcher.xml" "android\app\src\main\res\mipmap-anydpi-v26\ic_launcher_round.xml" > nul
)

echo 완료!
echo.
echo 다음 명령어로 앱을 실행하세요:
echo npx react-native run-android
