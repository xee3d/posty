@echo off
echo Posty 프로젝트 초기 설정 시작...

echo 1. node_modules 설치...
call npm install

echo 2. iOS 설정...
cd ios
call pod install
cd ..

echo 3. 환경 파일 생성...
if not exist .env (
    echo .env 파일을 생성해주세요!
    echo 필요한 환경 변수는 README.md를 참조하세요.
)

echo 설정 완료!
pause