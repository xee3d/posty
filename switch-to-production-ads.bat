@echo off
chcp 65001 > nul
echo ======================================
echo Posty AdMob 실제 광고 전환 스크립트
echo ======================================

echo.
echo ⚠️  주의: 이 스크립트를 실행하기 전에 반드시 .env 파일에 실제 광고 ID를 입력하세요!
echo.

REM .env 파일 확인
if not exist ".env" (
    echo ❌ 오류: .env 파일이 없습니다.
    echo .env.example을 복사하여 .env 파일을 만들고 실제 광고 ID를 입력하세요.
    pause
    exit /b 1
)

echo ✅ .env 파일 확인 완료
echo.

REM 백업 폴더 생성
if not exist "backup" mkdir backup

REM Android 설정
echo Android 설정 중...

set MANIFEST_PATH=android\app\src\main\AndroidManifest.xml
if exist "%MANIFEST_PATH%" (
    REM 백업 생성
    copy "%MANIFEST_PATH%" "backup\AndroidManifest.xml.backup" >nul
    echo ✅ AndroidManifest.xml 백업 완료
    echo.
    echo 📝 다음 작업을 수동으로 수행하세요:
    echo 1. android\app\src\main\AndroidManifest.xml 열기
    echo 2. 다음 라인 찾기:
    echo    android:value="ca-app-pub-3940256099942544~3347511713"
    echo 3. .env 파일의 ADMOB_APP_ID_ANDROID 값으로 변경
    echo.
) else (
    echo ❌ 오류: AndroidManifest.xml을 찾을 수 없습니다.
)

echo.
echo ======================================
echo 🎯 수동 설정 가이드
echo ======================================
echo.
echo 1. .env 파일 설정:
echo    - ADMOB_APP_ID_ANDROID=ca-app-pub-실제ID~앱번호
echo    - ADMOB_APP_ID_IOS=ca-app-pub-실제ID~앱번호
echo    - ADMOB_REWARDED_ANDROID=ca-app-pub-실제ID/광고단위ID
echo    - ADMOB_REWARDED_IOS=ca-app-pub-실제ID/광고단위ID
echo.
echo 2. Android 설정:
echo    - android\app\src\main\AndroidManifest.xml
echo    - com.google.android.gms.ads.APPLICATION_ID 값 변경
echo.
echo 3. iOS 설정 (Mac에서):
echo    - ios\Posty\Info.plist
echo    - GADApplicationIdentifier 값 변경
echo.
echo 4. 테스트 디바이스 등록:
echo    - 앱 실행 후 콘솔에서 디바이스 ID 확인
echo    - src\services\rewardAdService.ts에 추가
echo.
echo ======================================
echo 💡 중요 사항
echo ======================================
echo.
echo - 개발 모드에서는 여전히 테스트 광고가 표시됩니다
echo - 실제 광고는 릴리즈 빌드에서만 표시됩니다
echo - 개발 중 실제 광고 클릭 시 계정 정지 위험!
echo.
echo ======================================
echo.
pause
