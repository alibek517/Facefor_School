@echo off
chcp 65001 >nul 2>nul
title Maktab Face-ID Tizimi — Tezkor O'rnatish
color 0A

echo ======================================================================
echo           MAKTAB FACE-ID VA TURNIKET MONITORING TIZIMI
echo ======================================================================
echo.

set "INSTALL_DIR=C:\Maktab_FaceID_Tizimi"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

:: 0. Eski ishlab turgan serverni tezkor to'xtatish
taskkill /f /fi "WINDOWTITLE eq Maktab Face Bridge*" >nul 2>nul
wmic process where "name='node.exe' and commandline like '%%face-bridge.cjs%%'" call terminate >nul 2>nul

:: 1. Fleshkadan kompyuterga TEZKOR (robocopy /MT:16 /XO - faqat yangi/o'zgargan fayllar) o'rnatish
if /i not "%~dp0"=="%INSTALL_DIR%\" (
    echo [1/4] Tizim kompyuterga tezkor ko'chirilmoqda: %INSTALL_DIR%...
    if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%" >nul 2>nul
    if not exist "%INSTALL_DIR%\server" mkdir "%INSTALL_DIR%\server" >nul 2>nul
    if not exist "%INSTALL_DIR%\dist" mkdir "%INSTALL_DIR%\dist" >nul 2>nul
    if not exist "%INSTALL_DIR%\dist\assets" mkdir "%INSTALL_DIR%\dist\assets" >nul 2>nul

    :: Eski dist\assets fayllarini tozalash va yangi UI ni darhol ko'chirish
    del /q "%INSTALL_DIR%\dist\assets\*" >nul 2>nul
    if exist "%~dp0dist\index.html" copy /y "%~dp0dist\index.html" "%INSTALL_DIR%\dist\index.html" >nul 2>nul
    if exist "%~dp0dist\assets" robocopy "%~dp0dist\assets" "%INSTALL_DIR%\dist\assets" /E /NFL /NDL /NJH /NJS /NC /NS /NP /MT:16 >nul 2>nul

    :: Server kodlari (mavjud school_db.json saqlab qolinadi, yangi kod va cloudflared darhol ko'chiriladi)
    if exist "%~dp0server\face-bridge.cjs" copy /y "%~dp0server\face-bridge.cjs" "%INSTALL_DIR%\server\face-bridge.cjs" >nul 2>nul
    if exist "%~dp0server\cloudflared.exe" if not exist "%INSTALL_DIR%\server\cloudflared.exe" copy /y "%~dp0server\cloudflared.exe" "%INSTALL_DIR%\server\cloudflared.exe" >nul 2>nul
    if exist "%~dp0server\school_db.json" if not exist "%INSTALL_DIR%\server\school_db.json" copy /y "%~dp0server\school_db.json" "%INSTALL_DIR%\server\school_db.json" >nul 2>nul

    :: Rasmlarni faqat yetishmayotgan/yangi fayllarini ko'chirish (/XO = eskilarini qayta ko'chirmaydi -> 1 soniya!)
    if exist "%~dp0dist\photos" robocopy "%~dp0dist\photos" "%INSTALL_DIR%\dist\photos" /XO /NFL /NDL /NJH /NJS /NC /NS /NP /MT:16 >nul 2>nul
    if exist "%~dp0server\photo_cache" robocopy "%~dp0server\photo_cache" "%INSTALL_DIR%\server\photo_cache" /XO /NFL /NDL /NJH /NJS /NC /NS /NP /MT:16 >nul 2>nul
    if exist "%~dp0public\photos" (
        robocopy "%~dp0public\photos" "%INSTALL_DIR%\dist\photos" /XO /NFL /NDL /NJH /NJS /NC /NS /NP /MT:16 >nul 2>nul
        robocopy "%~dp0public\photos" "%INSTALL_DIR%\server\photo_cache" /XO /NFL /NDL /NJH /NJS /NC /NS /NP /MT:16 >nul 2>nul
    )

    if exist "%~dp0package.json" copy /y "%~dp0package.json" "%INSTALL_DIR%\" >nul 2>nul
    if exist "%~dp0src\faceUsers.json" (
        if not exist "%INSTALL_DIR%\src" mkdir "%INSTALL_DIR%\src" >nul 2>nul
        copy /y "%~dp0src\faceUsers.json" "%INSTALL_DIR%\src\faceUsers.json" >nul 2>nul
    )
    copy /y "%~f0" "%INSTALL_DIR%\START_MAKTAB.bat" >nul 2>nul
    echo       [OK] Fayllar tezkor ko'chirildi!
)

:: 2. Node.js borligini tekshirish va aniq yo'lini topish
set "PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs"
set "NODE_EXE=node"
if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"

where.exe node >nul 2>nul
if %errorlevel% neq 0 (
    if not exist "C:\Program Files\nodejs\node.exe" (
        echo.
        echo [2/4] Node.js kompyuterda topilmadi. Avtomatik o'rnatilmoqda...
        if exist "%~dp0NodeJS_Ornatuvchi.msi" (
            start /wait msiexec /i "%~dp0NodeJS_Ornatuvchi.msi" /passive /norestart
            set "NODE_EXE=C:\Program Files\nodejs\node.exe"
            echo       [OK] Node.js o'rnatildi!
        ) else if exist "%INSTALL_DIR%\NodeJS_Ornatuvchi.msi" (
            start /wait msiexec /i "%INSTALL_DIR%\NodeJS_Ornatuvchi.msi" /passive /norestart
            set "NODE_EXE=C:\Program Files\nodejs\node.exe"
            echo       [OK] Node.js o'rnatildi!
        )
    )
)

:: 3. Doimiy Avto-Ishga Tushish (Startup papka + Windows Registry Run -> restart va necha kundan keyin ham!)
echo.
echo [3/4] Kompyuter yonganda avtomatik ishga tushish sozlanmoqda...

(
    echo On Error Resume Next
    echo Set WshShell = CreateObject^("WScript.Shell"^)
    echo Set fso = CreateObject^("Scripting.FileSystemObject"^)
    echo installDir = "C:\Maktab_FaceID_Tizimi"
    echo bridgeScript = installDir ^& "\server\face-bridge.cjs"
    echo nodeExe = "node"
    echo If fso.FileExists^("C:\Program Files\nodejs\node.exe"^) Then
    echo     nodeExe = """C:\Program Files\nodejs\node.exe"""
    echo End If
    echo If fso.FileExists^(bridgeScript^) Then
    echo     WshShell.CurrentDirectory = installDir
    echo     WshShell.Run nodeExe ^& " server/face-bridge.cjs", 0, False
    echo     Set http = CreateObject^("MSXML2.XMLHTTP"^)
    echo     For i = 1 To 16
    echo         WScript.Sleep 500
    echo         Err.Clear
    echo         http.Open "GET", "http://localhost:5001/status", False
    echo         http.Send
    echo         If Err.Number = 0 Then
    echo             If http.Status = 200 Then Exit For
    echo         End If
    echo     Next
    echo     WshShell.Run "cmd /c start """" ""http://localhost:5001/""", 0, False
    echo End If
) > "%INSTALL_DIR%\Maktab_AvtoBoshlash.vbs"

:: Startup papkasiga ham nusxalash
if exist "%STARTUP_FOLDER%" (
    copy /y "%INSTALL_DIR%\Maktab_AvtoBoshlash.vbs" "%STARTUP_FOLDER%\Maktab_AvtoBoshlash.vbs" >nul 2>nul
)

:: Windows Registry Run kalitiga ham yozish (100% kafolatli avto-start!)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "SmartMaktab_FaceID" /t REG_SZ /d "wscript.exe //B \"%INSTALL_DIR%\Maktab_AvtoBoshlash.vbs\"" /f >nul 2>nul
echo       [OK] Avto-ishga tushish (Startup + Registry) sozlandi!

:: 4. Serverni TO'LIQ YASHIRIN (HIDDEN) holda ishga tushirish va brauzerda tezkor ochish
echo.
echo [4/4] Tizim yashirin fonda ishga tushirilmoqda...
wscript.exe //B "%INSTALL_DIR%\Maktab_AvtoBoshlash.vbs"

echo.
echo ======================================================================
echo  [MUVAFFAQIYATLI BAJARILDI!]
echo ----------------------------------------------------------------------
echo  1. Tizim kompyuterga tezkor o'rnatildi va fonda ishga tushdi!
echo  2. FLESHKANI BEMALOL SUG'URIB OLISHINGIZ MUMKIN!
echo  3. Kompyuter restart bo'lsa yoki necha kundan keyin yonsa ham,
echo     tizim o'zi avtomatik yashirin fonda yonib brauzerda srazi ochiladi!
echo ======================================================================
echo.
timeout /t 3 /nobreak >nul
exit
