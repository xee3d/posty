@echo off
cd C:\Users\xee3d\Documents\Posty

echo Cleaning up temporary BAT files...
echo.

:: 삭제할 파일들
del clean-build.bat 2>nul && echo Deleted: clean-build.bat
del fix-android-build.bat 2>nul && echo Deleted: fix-android-build.bat
del fix-multiple-emulators.bat 2>nul && echo Deleted: fix-multiple-emulators.bat
del quick-fix.bat 2>nul && echo Deleted: quick-fix.bat
del run-android.bat 2>nul && echo Deleted: run-android.bat
del run-on-emulator.bat 2>nul && echo Deleted: run-on-emulator.bat
del emulator-fix.bat 2>nul && echo Deleted: emulator-fix.bat
del start-emulator.bat 2>nul && echo Deleted: start-emulator.bat
del commit-all.bat 2>nul && echo Deleted: commit-all.bat
del commit-servers.bat 2>nul && echo Deleted: commit-servers.bat
del commit-everything.bat 2>nul && echo Deleted: commit-everything.bat
del cleanup-bats.bat 2>nul && echo Deleted: cleanup-bats.bat

echo.
echo Cleanup complete!
echo.
echo Remaining BAT files:
echo ====================
dir *.bat /b
echo ====================
echo.
pause
