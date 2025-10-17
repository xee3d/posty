#!/bin/bash

echo "🏗️ TestFlight 빌드 시작..."

# Clean
cd ios
xcodebuild clean -workspace Posty.xcworkspace -scheme Posty

# Archive
xcodebuild archive \
  -workspace Posty.xcworkspace \
  -scheme Posty \
  -configuration Release \
  -archivePath ./build/Posty.xcarchive

echo "✅ Archive 완료!"
echo "📦 다음 단계: Xcode → Window → Organizer → Distribute App → TestFlight"
