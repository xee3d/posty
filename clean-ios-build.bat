@echo off
echo iOS 빌드 완전 클린 시작...

cd ios

echo 캐시 제거 중...
rmdir /s /q Pods 2>nul
rmdir /s /q build 2>nul
del Podfile.lock 2>nul

echo Pod 재설치 중...
pod deintegrate
pod install --repo-update

cd ..

echo Metro 캐시 클리어...
npx react-native start --reset-cache

echo 완료!
pause