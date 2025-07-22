@echo off
chcp 65001 > nul
echo.
echo ===================================
echo Posty 앱 아이콘 설정 도우미
echo ===================================
echo.
echo 이 스크립트는 아이콘 변경을 도와줍니다.
echo.
echo 📌 필요한 작업:
echo.
echo 1. 온라인 아이콘 생성기 사용하기
echo    - Android: https://icon.kitchen/
echo    - iOS: https://www.appicon.co/
echo.
echo 2. images/posty_icon.png 파일 업로드
echo.
echo 3. 생성된 아이콘들을 다음 위치에 복사:
echo.
echo    📁 Android 아이콘 위치:
echo       android\app\src\main\res\mipmap-mdpi\
echo       android\app\src\main\res\mipmap-hdpi\
echo       android\app\src\main\res\mipmap-xhdpi\
echo       android\app\src\main\res\mipmap-xxhdpi\
echo       android\app\src\main\res\mipmap-xxxhdpi\
echo.
echo    📁 각 폴더에 필요한 파일:
echo       - ic_launcher.png
echo       - ic_launcher_round.png
echo.
echo ===================================
echo.
echo 아이콘 크기 정보:
echo   - mdpi: 48x48
echo   - hdpi: 72x72
echo   - xhdpi: 96x96
echo   - xxhdpi: 144x144
echo   - xxxhdpi: 192x192
echo.
echo ===================================
echo.
echo 완료 후 Android 앱 빌드:
echo   cd android
echo   gradlew clean
echo   gradlew assembleDebug
echo.
pause
