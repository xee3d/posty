@echo off
echo Creating desktop shortcut for QR Generator...

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Wireless QR Generator.lnk'); $Shortcut.TargetPath = '%~dp0open-qr-generator.bat'; $Shortcut.IconLocation = 'shell32.dll,13'; $Shortcut.Save()"

echo Shortcut created on desktop!
pause