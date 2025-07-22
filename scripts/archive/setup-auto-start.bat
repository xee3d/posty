@echo off
echo Creating Windows Task for Auto Device Connection...

REM 작업 이름
set TASK_NAME="Posty Auto Connect Device"

REM PowerShell 스크립트 경로
set SCRIPT_PATH="%~dp0auto-connect.ps1"

REM 작업 생성 (Windows 로그인 시 실행)
schtasks /create /tn %TASK_NAME% /tr "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File %SCRIPT_PATH%" /sc onlogon /rl highest /f

echo.
echo Task created successfully!
echo The device will auto-connect when Windows starts.
echo.
echo To remove this task later, run:
echo schtasks /delete /tn %TASK_NAME% /f
echo.
pause
