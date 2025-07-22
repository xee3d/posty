@echo off
echo Converting batch files to ANSI encoding...
echo.

REM Create temporary PowerShell script
echo $files = @( > convert-temp.ps1
echo     "fix-android-build.bat", >> convert-temp.ps1
echo     "posty-manager.bat", >> convert-temp.ps1
echo     "debug-android-build.bat" >> convert-temp.ps1
echo ) >> convert-temp.ps1
echo. >> convert-temp.ps1
echo foreach ($file in $files) { >> convert-temp.ps1
echo     if (Test-Path $file) { >> convert-temp.ps1
echo         $content = Get-Content $file -Encoding UTF8 >> convert-temp.ps1
echo         $content ^| Out-File $file -Encoding Default >> convert-temp.ps1
echo         Write-Host "Converted: $file" >> convert-temp.ps1
echo     } >> convert-temp.ps1
echo } >> convert-temp.ps1

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File convert-temp.ps1

REM Clean up
del convert-temp.ps1

echo.
echo Conversion complete!
echo You can now use the Korean batch files.
pause