@echo off
echo Killing existing Metro processes...
taskkill /f /im node.exe /t 2>nul
taskkill /f /im "React Native" /t 2>nul

echo Waiting for ports to be released...
timeout /t 3 /nobreak >nul

echo Starting Metro with cache reset...
npx react-native start --reset-cache
