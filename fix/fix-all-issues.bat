@echo off
chcp 949 > nul
echo ========================================
echo  Posty 앱 통합 문제 해결
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. 환경 변수 확인
echo [1/7] 환경 변수 확인 중...
echo.
if exist .env (
    echo ✅ .env 파일 발견
    findstr "NAVER_CONSUMER_KEY" .env > nul
    if errorlevel 1 (
        echo ❌ NAVER_CONSUMER_KEY가 없습니다!
    ) else (
        echo ✅ NAVER_CONSUMER_KEY 확인됨
    )
    
    findstr "KAKAO_APP_KEY" .env > nul
    if errorlevel 1 (
        echo ❌ KAKAO_APP_KEY가 없습니다!
    ) else (
        echo ✅ KAKAO_APP_KEY 확인됨
    )
    
    findstr "GOOGLE_WEB_CLIENT_ID" .env > nul
    if errorlevel 1 (
        echo ❌ GOOGLE_WEB_CLIENT_ID가 없습니다!
    ) else (
        echo ✅ GOOGLE_WEB_CLIENT_ID 확인됨
    )
) else (
    echo ❌ .env 파일이 없습니다!
    copy .env.example .env
    echo 📝 .env.example을 복사했습니다. API 키를 설정하세요.
)
echo.

:: 2. 키 해시 생성 및 출력
echo [2/7] 키 해시 생성 중...
echo.
echo 아래 키 해시를 각 플랫폼에 등록하세요:
echo.
powershell -Command "& {Write-Host '네이버 개발자 센터:' -ForegroundColor Yellow}"
cd android
gradlew signingReport 2>nul | findstr "SHA1" | head -1
cd ..
echo.
powershell -Command "& {Write-Host '카카오 개발자 센터:' -ForegroundColor Yellow}"
call get-key-hash.bat 2>nul
echo.

:: 3. 종속성 정리 및 재설치
echo [3/7] 종속성 정리 및 재설치 중...
echo.
rd /s /q node_modules 2>nul
del package-lock.json 2>nul
call npm cache clean --force
call npm install
echo.

:: 4. Android 빌드 정리
echo [4/7] Android 빌드 정리 중...
echo.
cd android
call gradlew clean
cd ..
echo.

:: 5. Metro 캐시 정리
echo [5/7] Metro 캐시 정리 중...
echo.
rd /s /q %TEMP%\metro-cache 2>nul
rd /s /q %TEMP%\react-native-* 2>nul
echo.

:: 6. 서버 상태 확인
echo [6/7] 서버 상태 확인 중...
echo.
echo AI 서버 확인...
curl -s -o nul -w "상태: %%{http_code}\n" https://posty-server-new.vercel.app/api/health
echo.
echo API 서버 확인...
curl -s -o nul -w "상태: %%{http_code}\n" https://posty-api.vercel.app/api/trends
echo.

:: 7. 서버 재배포
echo [7/7] 서버 재배포를 시작하시겠습니까?
echo.
choice /C YN /M "서버를 재배포하시겠습니까?"
if errorlevel 2 goto :skip_deploy

echo.
echo AI 서버 재배포 중...
cd posty-ai-server
call vercel --prod --yes
cd ..

echo.
echo API 서버 재배포 중...
cd posty-api-server
call vercel --prod --yes
cd ..

:skip_deploy
echo.
echo ========================================
echo  문제 해결 단계 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. .env 파일에 모든 API 키가 올바르게 설정되었는지 확인
echo 2. 각 플랫폼 개발자 센터에 키 해시 등록
echo 3. Firebase Console에서 OAuth 리디렉션 URI 설정
echo 4. 앱을 재실행하여 테스트
echo.
echo 앱 실행: npx react-native run-android
echo.
pause