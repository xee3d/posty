@echo off
chcp 949 > nul
echo ========================================
echo  소셜 로그인 문제 해결
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. 키 해시 생성
echo [1/5] 디버그 키 해시 생성 중...
echo.

:: Java keytool을 사용한 SHA1 추출
echo SHA1 지문:
cd android
for /f "tokens=2" %%a in ('gradlew signingReport 2^>nul ^| findstr "SHA1"') do (
    set SHA1=%%a
    goto :found_sha1
)
:found_sha1
cd ..
echo %SHA1%
echo.

:: 카카오용 키 해시 생성
echo 카카오 키 해시:
if exist android\app\debug.keystore (
    keytool -exportcert -alias androiddebugkey -keystore android\app\debug.keystore -storepass android | openssl sha1 -binary | openssl base64
) else (
    echo ❌ debug.keystore 파일을 찾을 수 없습니다!
)
echo.

:: 네이버용 정보
echo 네이버 등록 정보:
echo - 패키지명: com.posty
echo - SHA1: %SHA1%
echo.

:: 2. 플랫폼별 설정 안내
echo [2/5] 플랫폼별 설정 안내
echo.
echo ═══ 카카오 개발자 센터 ═══
echo 1. https://developers.kakao.com 접속
echo 2. 내 애플리케이션 → Posty 선택
echo 3. 앱 설정 → 플랫폼 → Android 플랫폼 등록
echo 4. 패키지명: com.posty
echo 5. 키 해시: 위에서 생성된 카카오 키 해시 입력
echo 6. 카카오 로그인 → 활성화 설정 ON
echo.

echo ═══ 네이버 개발자 센터 ═══
echo 1. https://developers.naver.com 접속
echo 2. 내 애플리케이션 → Posty 선택
echo 3. API 설정 → Android 설정
echo 4. 패키지명: com.posty
echo 5. SHA1: %SHA1%
echo 6. 네이버 아이디로 로그인 사용 설정
echo.

echo ═══ Google Firebase Console ═══
echo 1. https://console.firebase.google.com 접속
echo 2. Posty 프로젝트 선택
echo 3. Authentication → Sign-in method
echo 4. Google 로그인 활성화
echo 5. 프로젝트 설정 → 일반 → Android 앱
echo 6. SHA1 지문 추가: %SHA1%
echo.

:: 3. 환경 변수 체크
echo [3/5] 환경 변수 확인 중...
echo.
set MISSING_KEYS=0

findstr "NAVER_CONSUMER_KEY" .env > nul
if errorlevel 1 (
    echo ❌ NAVER_CONSUMER_KEY가 설정되지 않았습니다!
    echo    .env 파일에 추가하세요: NAVER_CONSUMER_KEY=your_key_here
    set MISSING_KEYS=1
)

findstr "NAVER_CONSUMER_SECRET" .env > nul
if errorlevel 1 (
    echo ❌ NAVER_CONSUMER_SECRET이 설정되지 않았습니다!
    echo    .env 파일에 추가하세요: NAVER_CONSUMER_SECRET=your_secret_here
    set MISSING_KEYS=1
)

findstr "KAKAO_APP_KEY" .env > nul
if errorlevel 1 (
    echo ❌ KAKAO_APP_KEY가 설정되지 않았습니다!
    echo    .env 파일에 추가하세요: KAKAO_APP_KEY=your_key_here
    set MISSING_KEYS=1
)

findstr "GOOGLE_WEB_CLIENT_ID" .env > nul
if errorlevel 1 (
    echo ❌ GOOGLE_WEB_CLIENT_ID가 설정되지 않았습니다!
    echo    .env 파일에 추가하세요: GOOGLE_WEB_CLIENT_ID=your_client_id_here
    set MISSING_KEYS=1
)

if %MISSING_KEYS%==0 (
    echo ✅ 모든 환경 변수가 설정되어 있습니다.
)
echo.

:: 4. 네이티브 설정 파일 업데이트
echo [4/5] 네이티브 설정 파일 확인 중...
echo.

:: Android Manifest 확인
if exist android\app\src\main\AndroidManifest.xml (
    findstr "kakao" android\app\src\main\AndroidManifest.xml > nul
    if errorlevel 1 (
        echo ⚠️ AndroidManifest.xml에 카카오 설정이 없을 수 있습니다.
    ) else (
        echo ✅ 카카오 설정 확인됨
    )
) else (
    echo ❌ AndroidManifest.xml을 찾을 수 없습니다!
)

:: 5. 빌드 재시작
echo.
echo [5/5] 클린 빌드를 시작하시겠습니까?
choice /C YN /M "클린 빌드를 진행하시겠습니까?"
if errorlevel 2 goto :skip_build

echo.
echo Metro 번들러 종료 중...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" 2>nul

echo.
echo Android 빌드 클린 중...
cd android
call gradlew clean
cd ..

echo.
echo 캐시 클리어 후 앱 실행 중...
npx react-native start --reset-cache &
timeout /t 3 /nobreak > nul
npx react-native run-android

:skip_build
echo.
echo ========================================
echo  설정 완료!
echo ========================================
echo.
echo 체크리스트:
echo [✓] 키 해시 생성 완료
echo [ ] 카카오 개발자 센터에 키 해시 등록
echo [ ] 네이버 개발자 센터에 SHA1 등록  
echo [ ] Firebase Console에 SHA1 등록
echo [ ] .env 파일에 모든 키 설정
echo [ ] 앱에서 소셜 로그인 테스트
echo.
pause