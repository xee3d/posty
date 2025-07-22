' Create Desktop Shortcuts for Posty Development Tools
Option Explicit

Dim WshShell, FSO, DesktopPath, PostyPath
Dim Response, IconPath

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Get paths
DesktopPath = WshShell.SpecialFolders("Desktop")
PostyPath = "C:\Users\xee3d\Documents\Posty"

' Check if Posty directory exists
If Not FSO.FolderExists(PostyPath) Then
    MsgBox "Posty directory not found at: " & PostyPath, vbCritical, "Error"
    WScript.Quit
End If

' Find icon file (try multiple locations)
If FSO.FileExists(PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png") Then
    IconPath = PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png"
ElseIf FSO.FileExists(PostyPath & "\images\icon.ico") Then
    IconPath = PostyPath & "\images\icon.ico"
Else
    IconPath = "%SystemRoot%\System32\cmd.exe" ' Default CMD icon
End If

' Ask user what shortcuts to create
Response = MsgBox("Create desktop shortcuts for Posty?" & vbCrLf & vbCrLf & _
                  "This will create shortcuts for:" & vbCrLf & _
                  "- Posty Manager (All-in-one tool)" & vbCrLf & _
                  "- Wireless Dev" & vbCrLf & _
                  "- Clean Build" & vbCrLf & _
                  "- QR Generator", _
                  vbYesNo + vbQuestion, "Create Shortcuts")

If Response = vbNo Then
    WScript.Quit
End If

' Create Posty Manager shortcut
CreateShortcut DesktopPath & "\Posty Manager.lnk", _
               PostyPath & "\posty-manager-en.bat", _
               "", _
               PostyPath, _
               "Posty All-in-One Manager", _
               IconPath, _
               1

' Create Wireless Dev shortcut
If FSO.FileExists(PostyPath & "\wireless-dev.bat") Then
    CreateShortcut DesktopPath & "\Posty Wireless Dev.lnk", _
                   PostyPath & "\wireless-dev.bat", _
                   "", _
                   PostyPath, _
                   "Posty Wireless Development", _
                   IconPath, _
                   1
End If

' Create Clean Build shortcut
If FSO.FileExists(PostyPath & "\clean-build.bat") Then
    CreateShortcut DesktopPath & "\Posty Clean Build.lnk", _
                   PostyPath & "\clean-build.bat", _
                   "", _
                   PostyPath, _
                   "Clean and rebuild Posty", _
                   IconPath, _
                   1
End If

' Create QR Generator shortcut
If FSO.FileExists(PostyPath & "\generate-qr-fixed.py") Then
    CreateShortcut DesktopPath & "\Posty QR Generator.lnk", _
                   "python.exe", _
                   """" & PostyPath & "\generate-qr-fixed.py""", _
                   PostyPath, _
                   "Generate QR for wireless debugging", _
                   IconPath, _
                   1
End If

MsgBox "Desktop shortcuts created successfully!", vbInformation, "Success"

' Function to create shortcut
Sub CreateShortcut(LinkPath, TargetPath, Arguments, WorkingDir, Description, IconPath, WindowStyle)
    Dim oShellLink
    Set oShellLink = WshShell.CreateShortcut(LinkPath)
    
    oShellLink.TargetPath = TargetPath
    If Arguments <> "" Then oShellLink.Arguments = Arguments
    oShellLink.WindowStyle = WindowStyle
    oShellLink.IconLocation = IconPath
    oShellLink.Description = Description
    oShellLink.WorkingDirectory = WorkingDir
    oShellLink.Save
End Sub