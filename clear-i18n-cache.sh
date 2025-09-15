#!/bin/bash

echo "🧹 React Native i18n 캐시 완전 초기화 시작..."

# Metro 캐시 삭제
echo "📱 Metro 캐시 삭제 중..."
npx react-native start --reset-cache --no-interactive &
PID=$!
sleep 3
kill $PID 2>/dev/null

# 추가 캐시 디렉토리 삭제
echo "🗂️ 추가 캐시 삭제 중..."
rm -rf /tmp/react-native-*
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*
rm -rf node_modules/.cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# Watchman 캐시 삭제 (있는 경우)
if command -v watchman &> /dev/null; then
    echo "👁️ Watchman 캐시 삭제 중..."
    watchman watch-del-all
fi

# iOS 시뮬레이터 앱 삭제 (있는 경우)
if [ -d ~/Library/Developer/CoreSimulator ]; then
    echo "📱 iOS 시뮬레이터 앱 데이터 삭제 중..."
    xcrun simctl shutdown all
    xcrun simctl erase all
fi

echo "✅ 캐시 초기화 완료!"
echo "🚀 이제 'npm run start:clean'을 실행하여 앱을 다시 시작하세요."