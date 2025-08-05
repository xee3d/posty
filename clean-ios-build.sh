#!/bin/bash
echo "iOS 빌드 완전 클린 시작..."

cd ios

echo "캐시 제거 중..."
rm -rf Pods
rm -rf build
rm -f Podfile.lock

echo "Pod 재설치 중..."
pod deintegrate
pod install --repo-update

cd ..

echo "Metro 캐시 클리어..."
npx react-native start --reset-cache

echo "완료!"