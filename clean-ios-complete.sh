#!/bin/bash

echo "========================================"
echo "React Native iOS Complete Clean Build"
echo "========================================"
echo

echo "[1/8] Stopping Metro bundler..."
pkill -f "react-native start" 2>/dev/null || echo "Metro bundler not running"

echo "[2/8] Cleaning React Native cache..."
npx react-native start --reset-cache --stop 2>/dev/null &
sleep 2
pkill -f "react-native start" 2>/dev/null
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null

echo "[3/8] Clearing Watchman cache..."
watchman watch-del-all 2>/dev/null || echo "Watchman not available"

echo "[4/8] Removing iOS build artifacts..."
rm -rf ios/build 2>/dev/null
rm -rf ios/Pods 2>/dev/null
rm -f ios/Podfile.lock 2>/dev/null

echo "[5/8] Clearing Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData 2>/dev/null

echo "[6/8] Clearing npm/yarn cache..."
npm cache clean --force
yarn cache clean 2>/dev/null || echo "Yarn not available"

echo "[7/8] Reinstalling dependencies..."
npm install
cd ios && pod install && cd ..

echo "[8/8] Applying patches..."
npx patch-package

echo
echo "========================================"
echo "Clean build completed successfully!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Run: npm run ios"
echo "2. Or use Xcode to build the project"
echo