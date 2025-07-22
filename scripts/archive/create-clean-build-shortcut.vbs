' Create Clean Build Shortcut Only
Option Explicit

Dim WshShell, FSO, oShellLink
Dim DesktopPath, PostyPath, IconPath

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Get paths
DesktopPath = WshShell.SpecialFolders("Desktop")
PostyPath = "C:\Users\xee3d\Documents\Posty"

' Validate paths
If Not FSO.FolderExists(PostyPath) Then
    MsgBox "Posty directory not found at: " & PostyPath, vbCritical, "Error"
    WScript.Quit
End If

If Not FSO.FileExists(PostyPath & "\clean-build.bat") Then
    MsgBox "clean-build.bat not found in Posty directory!", vbCritical, "Error"
    WScript.Quit
End If

' Find icon
If FSO.FileExists(PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png") Then
    IconPath = PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png"
Else
    IconPath = "%SystemRoot%\System32\cmd.exe"
End If

' Create Clean Build shortcut
Set oShellLink = WshShell.CreateShortcut(DesktopPath & "\Posty Clean Build.lnk")
oShellLink.TargetPath = PostyPath & "\clean-build.bat"
oShellLink.WindowStyle = 1
oShellLink.IconLocation = IconPath
oShellLink.Description = "Clean and rebuild Posty project"
oShellLink.WorkingDirectory = PostyPath
oShellLink.Save

MsgBox "Clean Build shortcut created on desktop!", vbInformation, "Success"