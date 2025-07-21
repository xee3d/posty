@echo off
chcp 949 > nul
echo ========================================
echo  Posty 서버 문제 해결
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. 현재 서버 상태 확인
echo [1/4] 현재 서버 상태 확인 중...
echo.

echo === AI 서버 (posty-ai-server) ===
set AI_SERVERS=https://posty-server-new.vercel.app https://posty-server.vercel.app https://posty-server-xee3d.vercel.app
for %%s in (%AI_SERVERS%) do (
    echo %%s 확인 중...
    curl -s -o nul -w "  상태: %%{http_code} - " %%s/api/health
    curl -s %%s/api/health 2>nul | findstr "ok" >nul
    if not errorlevel 1 (
        echo ✅ 작동 중
    ) else (
        echo ❌ 응답 없음
    )
)
echo.

echo === API 서버 (트렌드 서버) ===
set API_URL=https://posty-api.vercel.app
echo %API_URL% 확인 중...
curl -s -o nul -w "  상태: %%{http_code} - " %API_URL%/api/trends
curl -s %API_URL%/api/trends 2>nul | findstr "trends" >nul
if not errorlevel 1 (
    echo ✅ 작동 중
) else (
    echo ❌ 응답 없음
)
echo.

:: 2. Vercel 프로젝트 확인
echo [2/4] Vercel 프로젝트 상태 확인 중...
echo.

:: AI 서버 프로젝트 확인
cd posty-ai-server
if exist vercel.json (
    echo ✅ AI 서버 vercel.json 발견
    type vercel.json
) else (
    echo ❌ AI 서버 vercel.json 없음 - 생성 중...
    echo { > vercel.json
    echo   "functions": { >> vercel.json
    echo     "api/*.js": { >> vercel.json
    echo       "maxDuration": 30 >> vercel.json
    echo     } >> vercel.json
    echo   } >> vercel.json
    echo } >> vercel.json
)
echo.
cd ..

:: API 서버 프로젝트 확인
cd posty-api-server
if exist vercel.json (
    echo ✅ API 서버 vercel.json 발견
    type vercel.json
) else (
    echo ❌ API 서버 vercel.json 없음 - 생성 중...
    echo { > vercel.json
    echo   "functions": { >> vercel.json
    echo     "api/*.js": { >> vercel.json
    echo       "maxDuration": 30 >> vercel.json
    echo     } >> vercel.json
    echo   }, >> vercel.json
    echo   "env": { >> vercel.json
    echo     "FIREBASE_SERVICE_ACCOUNT": "@firebase-service-account" >> vercel.json
    echo   } >> vercel.json
    echo } >> vercel.json
)
echo.
cd ..

:: 3. 서버 파일 검증
echo [3/4] 서버 파일 검증 중...
echo.

:: AI 서버 health check 파일 확인
if exist posty-ai-server\api\health.js (
    echo ✅ AI 서버 health.js 존재
) else (
    echo ❌ AI 서버 health.js 없음 - 생성 중...
    mkdir posty-ai-server\api 2>nul
    echo export default function handler(req, res) { > posty-ai-server\api\health.js
    echo   res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }); >> posty-ai-server\api\health.js
    echo } >> posty-ai-server\api\health.js
)

:: API 서버 trends 파일 확인
if exist posty-api-server\api\trends.js (
    echo ✅ API 서버 trends.js 존재
) else (
    echo ❌ API 서버 trends.js 없음!
    echo    posty-api-server/api/ 폴더를 확인하세요.
)
echo.

:: 4. 서버 재배포
echo [4/4] 서버를 재배포하시겠습니까?
echo.
echo 주의: Vercel CLI가 설치되어 있고 로그인되어 있어야 합니다.
echo.
choice /C YN /M "서버를 재배포하시겠습니까?"
if errorlevel 2 goto :skip_deploy

:: Vercel CLI 설치 확인
where vercel >nul 2>nul
if errorlevel 1 (
    echo.
    echo ❌ Vercel CLI가 설치되어 있지 않습니다!
    echo.
    echo Vercel CLI 설치 중...
    call npm install -g vercel
    echo.
    echo Vercel 로그인이 필요합니다:
    call vercel login
)

echo.
echo === AI 서버 재배포 ===
cd posty-ai-server
echo 현재 디렉토리: %CD%
call vercel --prod --yes
if errorlevel 1 (
    echo.
    echo ❌ AI 서버 배포 실패!
    echo 수동으로 다음 명령을 실행하세요:
    echo cd posty-ai-server
    echo vercel --prod
) else (
    echo ✅ AI 서버 배포 성공!
)
cd ..

echo.
echo === API 서버 재배포 ===
cd posty-api-server
echo 현재 디렉토리: %CD%
call vercel --prod --yes
if errorlevel 1 (
    echo.
    echo ❌ API 서버 배포 실패!
    echo 수동으로 다음 명령을 실행하세요:
    echo cd posty-api-server
    echo vercel --prod
) else (
    echo ✅ API 서버 배포 성공!
)
cd ..

:skip_deploy
echo.
echo ========================================
echo  서버 문제 해결 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. 배포된 서버 URL 확인 (Vercel 대시보드)
echo 2. .env 파일의 API_URL 업데이트
echo 3. serverConfig.js의 서버 목록 업데이트
echo 4. 앱을 재시작하여 서버 연결 테스트
echo.
echo 문제가 지속되면:
echo - Vercel 대시보드에서 함수 로그 확인
echo - Firebase 서비스 계정 키 설정 확인
echo - CORS 설정 확인
echo.
pause