@echo off
chcp 949
echo ========================================
echo SVN Status and Changes Summary
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Files successfully added to SVN:
echo ----------------------------------------
echo - DEPENDENCY_COMPATIBILITY_MATRIX.md
echo - FIREBASE_SETUP_GUIDE.md
echo - REACT_NATIVE_074_UPGRADE_REPORT.md
echo - SVN_IGNORE_CHECKLIST.md
echo - package-lock.json
echo - my_changes.patch
echo - Android Java files (com.posty package)
echo - All scripts in scripts folder
echo - logs folder
echo.

echo Files with issues (marked with !):
echo ----------------------------------------
svn status | findstr "^!"

echo.
echo Modified files:
echo ----------------------------------------
svn status | findstr "^M"

echo.
echo Unversioned files:
echo ----------------------------------------
svn status | findstr "^?"

echo.
echo ========================================
echo UUID Mismatch Details:
echo ========================================
echo Repository UUID expected: b9d7be5b-3f9e-8148-a7a1-6121d9dc749c
echo Current working copy UUID: b959dfb5-d60d-3640-bc07-045262b74b31
echo.
echo This means your working copy is from a different repository.
echo.
pause
