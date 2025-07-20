@echo off
echo === Check Git Structure ===
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo Current directory structure:
git ls-files | findstr "posty-server" | head -10
echo.

echo Checking if posty-server changes are tracked:
git status posty-server/
echo.

echo Recent commits affecting posty-server:
git log --oneline -5 -- posty-server/
echo.

pause
