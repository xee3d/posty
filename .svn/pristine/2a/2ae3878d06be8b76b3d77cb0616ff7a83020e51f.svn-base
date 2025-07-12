@echo off
chcp 949
echo ========================================
echo Emergency: .env file security
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo [WARNING] Real API keys found in .env file!
echo.
echo Following actions will be performed:
echo 1. Backup .env to .env.backup
echo 2. Replace .env with .env.example content
echo 3. Remove .env from SVN
echo.
echo Press any key to continue...
pause

REM Create backup
copy .env .env.backup
echo Backed up .env to .env.backup

REM Replace with example
copy .env.example .env /Y
echo Replaced .env with safe example file

REM Remove from SVN (keep local)
svn rm --keep-local .env
echo Removed .env from SVN (local file kept)

echo.
echo ========================================
echo Complete! 
echo ========================================
echo.
echo IMPORTANT: 
echo - NEVER commit .env.backup file!
echo - For development, copy content from .env.backup to .env
echo - .env is now ignored by SVN
echo.
pause
