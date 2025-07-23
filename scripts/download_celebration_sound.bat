@echo off
echo 축하 사운드 다운로드 중...

REM 무료 축하/폭죽 사운드 다운로드
REM Freesound.org의 Creative Commons 라이센스 사운드 사용

REM 축하 사운드 (짧고 경쾌한 버전)
powershell -Command "Invoke-WebRequest -Uri 'https://freesound.org/data/previews/316/316920_5123451-lq.mp3' -OutFile 'celebration_temp.mp3'"

REM Android raw 폴더로 복사
copy /Y celebration_temp.mp3 "..\android\app\src\main\res\raw\celebration.mp3"

REM iOS 리소스 폴더로도 복사 (iOS 프로젝트가 있는 경우)
if exist "..\ios" (
    copy /Y celebration_temp.mp3 "..\ios\Posty\celebration.mp3"
)

REM 임시 파일 삭제
del celebration_temp.mp3

echo 축하 사운드 설치 완료!
echo.
echo 참고: 더 좋은 사운드를 원하시면 다음 사이트에서 무료 사운드를 찾아보세요:
echo - https://freesound.org (검색: "celebration", "party", "success")
echo - https://www.zapsplat.com (무료 가입 필요)
echo - https://soundbible.com
echo.
echo 추천 검색어:
echo - party horn
echo - confetti pop
echo - celebration chime
echo - success fanfare
echo - achievement unlocked
echo.
pause
