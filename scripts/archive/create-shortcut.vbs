' Create Desktop Shortcuts for Posty Development
Option Explicit

Dim WshShell, FSO, oShellLink
Dim DesktopPath, PostyPath, IconPath
Dim Response, Choice

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Get paths
DesktopPath = WshShell.SpecialFolders("Desktop")
PostyPath = "C:\Users\xee3d\Documents\Posty"

' Validate Posty directory exists
If Not FSO.FolderExists(PostyPath) Then
    MsgBox "Posty directory not found at: " & PostyPath, vbCritical, "Error"
    WScript.Quit
End If

' Find icon path
If FSO.FileExists(PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png") Then
    IconPath = PostyPath & "\android\app\src\main\res\mipmap-hdpi\ic_launcher.png"
ElseIf FSO.FileExists(PostyPath & "\android\app\src\main\ic_launcher.ico") Then
    IconPath = PostyPath & "\android\app\src\main\ic_launcher.ico"
Else
    IconPath = "%SystemRoot%\System32\cmd.exe"
End If

' Ask user which shortcut to create
Choice = InputBox("Which shortcut would you like to create?" & vbCrLf & vbCrLf & _
                  "1 = Posty Manager (All-in-one)" & vbCrLf & _
                  "2 = Wireless Dev" & vbCrLf & _
                  "3 = Wireless Dev + Clean Build" & vbCrLf & _
                  "4 = Clean Build Only" & vbCrLf & _
                  "5 = All shortcuts" & vbCrLf & vbCrLf & _
                  "Enter number (1-5):", "Create Shortcut", "3")

If Choice = "" Then
    WScript.Quit
End If

Select Case Choice
    Case "1"
        ' Create Posty Manager shortcut
        If FSO.FileExists(PostyPath & "\posty-manager-en.bat") Then
            CreateShortcut "Posty Manager", "posty-manager-en.bat", "Posty Development Manager"
        ElseIf FSO.FileExists(PostyPath & "\posty-manager.bat") Then
            CreateShortcut "Posty Manager", "posty-manager.bat", "Posty Development Manager"
        Else
            MsgBox "Posty Manager batch file not found!", vbCritical, "Error"
        End If
        
    Case "2"
        ' Create Wireless Dev shortcut
        If FSO.FileExists(PostyPath & "\wireless-dev.bat") Then
            CreateShortcut "Posty Wireless Dev", "wireless-dev.bat", "Posty Wireless Development"
        Else
            MsgBox "wireless-dev.bat not found!", vbCritical, "Error"
        End If
        
    Case "3"
        ' Create Wireless Dev with Clean Build shortcut
        CreateWirelessCleanShortcut
        
    Case "4"
        ' Create Clean Build shortcut
        If FSO.FileExists(PostyPath & "\clean-build.bat") Then
            CreateShortcut "Posty Clean Build", "clean-build.bat", "Clean and rebuild Posty project"
        Else
            MsgBox "clean-build.bat not found!", vbCritical, "Error"
        End If
        
    Case "5"
        ' Create all shortcuts
        Dim CreatedCount
        CreatedCount = 0
        
        ' Posty Manager
        If FSO.FileExists(PostyPath & "\posty-manager-en.bat") Then
            CreateShortcut "Posty Manager", "posty-manager-en.bat", "Posty Development Manager"
            CreatedCount = CreatedCount + 1
        ElseIf FSO.FileExists(PostyPath & "\posty-manager.bat") Then
            CreateShortcut "Posty Manager", "posty-manager.bat", "Posty Development Manager"
            CreatedCount = CreatedCount + 1
        End If
        
        ' Wireless Dev
        If FSO.FileExists(PostyPath & "\wireless-dev.bat") Then
            CreateShortcut "Posty Wireless Dev", "wireless-dev.bat", "Posty Wireless Development"
            CreatedCount = CreatedCount + 1
        End If
        
        ' Wireless Dev + Clean Build
        CreateWirelessCleanShortcut
        CreatedCount = CreatedCount + 1
        
        ' Clean Build
        If FSO.FileExists(PostyPath & "\clean-build.bat") Then
            CreateShortcut "Posty Clean Build", "clean-build.bat", "Clean and rebuild Posty project"
            CreatedCount = CreatedCount + 1
        End If
        
        If CreatedCount > 0 Then
            MsgBox CreatedCount & " shortcuts created successfully!", vbInformation, "Success"
        Else
            MsgBox "No batch files found to create shortcuts!", vbExclamation, "Warning"
        End If
        WScript.Quit
        
    Case Else
        MsgBox "Invalid choice. Please run again and enter 1-5.", vbExclamation, "Invalid Input"
        WScript.Quit
End Select

' Function to create shortcut for batch files
Sub CreateShortcut(ShortcutName, BatchFile, Description)
    Set oShellLink = WshShell.CreateShortcut(DesktopPath & "\" & ShortcutName & ".lnk")
    oShellLink.TargetPath = PostyPath & "\" & BatchFile
    oShellLink.WindowStyle = 1
    oShellLink.IconLocation = IconPath
    oShellLink.Description = Description
    oShellLink.WorkingDirectory = PostyPath
    oShellLink.Save
    MsgBox "Shortcut '" & ShortcutName & "' created successfully!", vbInformation, "Success"
End Sub

' Function to create Wireless Dev + Clean Build shortcut
Sub CreateWirelessCleanShortcut()
    ' First create the combined batch file if it doesn't exist
    Dim CombinedBatchPath, FileContent
    CombinedBatchPath = PostyPath & "\wireless-clean-dev.bat"
    
    If Not FSO.FileExists(CombinedBatchPath) Then
        Set FileContent = FSO.CreateTextFile(CombinedBatchPath, True)
        FileContent.WriteLine "@echo off"
        FileContent.WriteLine "echo === Posty Wireless Development with Clean Build ==="
        FileContent.WriteLine "echo."
        FileContent.WriteLine "echo Select an option:"
        FileContent.WriteLine "echo [1] Start Wireless Dev (Normal)"
        FileContent.WriteLine "echo [2] Clean Build + Wireless Dev"
        FileContent.WriteLine "echo [3] Clean Build Only"
        FileContent.WriteLine "echo."
        FileContent.WriteLine "set /p choice=""Choice (1-3): """
        FileContent.WriteLine ""
        FileContent.WriteLine "if ""%choice%""==""1"" goto WIRELESS_ONLY"
        FileContent.WriteLine "if ""%choice%""==""2"" goto CLEAN_AND_WIRELESS"
        FileContent.WriteLine "if ""%choice%""==""3"" goto CLEAN_ONLY"
        FileContent.WriteLine "goto END"
        FileContent.WriteLine ""
        FileContent.WriteLine ":WIRELESS_ONLY"
        FileContent.WriteLine "if exist wireless-dev.bat ("
        FileContent.WriteLine "    call wireless-dev.bat"
        FileContent.WriteLine ") else ("
        FileContent.WriteLine "    echo Starting wireless development..."
        FileContent.WriteLine "    call npx react-native run-android"
        FileContent.WriteLine ")"
        FileContent.WriteLine "goto END"
        FileContent.WriteLine ""
        FileContent.WriteLine ":CLEAN_AND_WIRELESS"
        FileContent.WriteLine "echo."
        FileContent.WriteLine "echo Cleaning project..."
        FileContent.WriteLine "cd android"
        FileContent.WriteLine "call gradlew clean"
        FileContent.WriteLine "cd .."
        FileContent.WriteLine "echo."
        FileContent.WriteLine "echo Starting wireless development..."
        FileContent.WriteLine "if exist wireless-dev.bat ("
        FileContent.WriteLine "    call wireless-dev.bat"
        FileContent.WriteLine ") else ("
        FileContent.WriteLine "    call npx react-native run-android"
        FileContent.WriteLine ")"
        FileContent.WriteLine "goto END"
        FileContent.WriteLine ""
        FileContent.WriteLine ":CLEAN_ONLY"
        FileContent.WriteLine "if exist clean-build.bat ("
        FileContent.WriteLine "    call clean-build.bat"
        FileContent.WriteLine ") else ("
        FileContent.WriteLine "    echo Cleaning and rebuilding..."
        FileContent.WriteLine "    cd android"
        FileContent.WriteLine "    call gradlew clean"
        FileContent.WriteLine "    cd .."
        FileContent.WriteLine "    echo."
        FileContent.WriteLine "    echo Rebuilding..."
        FileContent.WriteLine "    call npx react-native run-android"
        FileContent.WriteLine ")"
        FileContent.WriteLine ""
        FileContent.WriteLine ":END"
        FileContent.WriteLine "pause"
        FileContent.Close
    End If
    
    ' Create the shortcut
    Set oShellLink = WshShell.CreateShortcut(DesktopPath & "\Posty Wireless + Clean.lnk")
    oShellLink.TargetPath = CombinedBatchPath
    oShellLink.WindowStyle = 1
    oShellLink.IconLocation = IconPath
    oShellLink.Description = "Wireless Dev with Clean Build option"
    oShellLink.WorkingDirectory = PostyPath
    oShellLink.Save
    
    MsgBox "Shortcut 'Posty Wireless + Clean' created successfully!", vbInformation, "Success"
End Sub