#!/bin/bash
echo "Posty 프로젝트 초기 설정 시작..."

echo "1. node_modules 설치..."
npm install

echo "2. iOS 설정..."
cd ios
pod install
cd ..

echo "3. 환경 파일 생성..."
if [ ! -f .env ]; then
    echo ".env 파일을 생성해주세요!"
    echo "필요한 환경 변수는 README.md를 참조하세요."
fi

echo "설정 완료!"