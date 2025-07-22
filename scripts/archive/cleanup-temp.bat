@echo off
echo ====================================
echo   Cleaning up BAT files
echo ====================================

cd C:\Users\xee3d\Documents\Posty

echo.
echo Removing temporary/redundant BAT files...

:: 임시로 만든 파일들 삭제
del clean-build.bat 2>nul
del fix-android-build.bat 2>nul
del fix-multiple-emulators.bat 2>nul
del quick-fix.bat 2>nul
del run-android.bat 2>nul
del run-on-emulator.bat 2>nul
del emulator-fix.bat 2>nul
del start-emulator.bat 2>nul
del commit-all.bat 2>nul
del commit-servers.bat 2>nul
del commit-everything.bat 2>nul

echo.
echo Cleanup complete!
echo.
echo Remaining essential BAT files:
dir *.bat /b
echo.
pause
