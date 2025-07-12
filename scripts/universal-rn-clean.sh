#!/bin/bash
# Universal React Native Android Build Cleaner
# macOS/Linux version

echo "========================================"
echo "    React Native Android Build Cleaner"
echo "    (Universal Version)"
echo "========================================"
echo

# Get current directory as project root
PROJECT_ROOT=$(pwd)

# Check if this is a React Native project
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    echo "Make sure you run this script from your React Native project root"
    exit 1
fi

if [ ! -d "android" ]; then
    echo "ERROR: android directory not found!"
    echo "This doesn't appear to be a React Native project"
    exit 1
fi

echo "Project Root: $PROJECT_ROOT"
echo

echo "[1/6] Killing Java processes..."
pkill -f java || true
echo

echo "[2/6] Stopping Gradle daemon..."
cd android
./gradlew --stop || true
cd ..
echo

echo "[3/6] Removing build directories..."
cd android

# Remove with error handling
if [ -d ".gradle" ]; then
    echo "Removing .gradle..."
    rm -rf .gradle || echo "WARNING: Could not remove .gradle completely"
fi

if [ -d "build" ]; then
    echo "Removing build..."
    rm -rf build
fi

if [ -d "app/build" ]; then
    echo "Removing app/build..."
    rm -rf app/build || echo "WARNING: Could not remove app/build completely"
fi

cd ..
echo

echo "[4/6] Clearing temp files..."
# Clear gradle caches
if [ -d "$HOME/.gradle/caches" ]; then
    read -p "Clear Gradle cache? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Clearing Gradle cache..."
        rm -rf "$HOME/.gradle/caches"
    fi
fi
echo

echo "[5/6] Running gradle clean..."
cd android
./gradlew clean || true
cd ..
echo

echo "[6/6] Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf .metro-cache 2>/dev/null || true
echo

echo "========================================"
echo "    Cleanup Complete!"
echo "========================================"
echo
echo "Cleaned:"
echo "- Gradle build directories"
echo "- Android build cache"
echo "- Metro bundler cache"
echo
echo "Next steps:"
echo "1. npx react-native run-android"
echo "2. OR: cd android && ./gradlew assembleDebug"
echo