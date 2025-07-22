' Create single shortcut with custom settings
Option Explicit

Dim WshShell, FSO
Dim ShortcutName, TargetFile, Arguments, IconPath
Dim DesktopPath, PostyPath

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Configuration - MODIFY THESE VALUES AS NEEDED
ShortcutName = "Posty Manager"                    ' Name of the shortcut
TargetFile = "posty-manager-en.bat"               ' File to run
Arguments = ""                                     ' Additional arguments (if any)

' Paths
DesktopPath = WshShell.SpecialFolders("Desktop")
PostyPath = "C:\Users\xee3d\Documents\Posty"

' Validate paths
If Not FSO.FolderExists(PostyPath) Then
    MsgBox "Posty directory not found at: " & PostyPath, vbCritical, "Error"
    WScript.Quit
End If

If Not FSO.FileExists(PostyPath & "\" & TargetFile) Then
    MsgBox "Target file not found: " & TargetFile, vbCritical, "Error"
    WScript.Quit
End If

' Find icon
If FSO.FileExists(PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png") Then
    IconPath = PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png"
Else
    IconPath = "%SystemRoot%\System32\cmd.exe"
End If

' Create shortcut
Dim oShellLink
Set oShellLink = WshShell.CreateShortcut(DesktopPath & "\" & ShortcutName & ".lnk")

oShellLink.TargetPath = PostyPath & "\" & TargetFile
If Arguments <> "" Then oShellLink.Arguments = Arguments
oShellLink.WindowStyle = 1
oShellLink.IconLocation = IconPath
oShellLink.Description = "Launch " & ShortcutName
oShellLink.WorkingDirectory = PostyPath
oShellLink.Save

MsgBox "Shortcut '" & ShortcutName & "' created on desktop!", vbInformation, "Success"