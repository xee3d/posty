@echo off
echo Checking Git branch...
git branch
echo.
echo Setting upstream and pushing...
git push --set-upstream origin main
echo.
pause
