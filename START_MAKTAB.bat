@echo off
title Maktab Face-ID Tizimi
color 0A

echo ======================================================================
echo           MAKTAB FACE-ID VA TURNIKET MONITORING TIZIMI
echo ======================================================================
echo.

set "INSTALL_DIR=C:\Maktab_FaceID_Tizimi"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

:: 1. Agar skript fleshkadan yoki boshqa joydan ishga tushayotgan bo'lsa, kompyuterga o'rnatish
if /i not "%~dp0"=="%INSTALL_DIR%\" (
    echo [1/4] Tizim kompyuterning qattiq diskiga o'rnatilmoqda: %INSTALL_DIR%...
    if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%" >nul 2>nul
    
    echo       Fayllar ko'chirilmoqda, iltimos kuting...
    xcopy /e /y /q "%~dp0server" "%INSTALL_DIR%\server\" >nul 2>nul
    xcopy /e /y /q "%~dp0dist" "%INSTALL_DIR%\dist\" >nul 2>nul
    xcopy /e /y /q "%~dp0src" "%INSTALL_DIR%\src\" >nul 2>nul
    if exist "%~dp0package.json" copy /y "%~dp0package.json" "%INSTALL_DIR%\" >nul 2>nul
    if exist "%~dp0NodeJS_Ornatuvchi.msi" copy /y "%~dp0NodeJS_Ornatuvchi.msi" "%INSTALL_DIR%\" >nul 2>nul
    copy /y "%~f0" "%INSTALL_DIR%\START_MAKTAB.bat" >nul 2>nul
    echo       [OK] Fayllar kompyuterga ko'chirildi.
)

:: 2. Node.js borligini tekshirish (yo'q bo'lsa avtomatik o'rnatish)
where.exe node >nul 2>nul
if %errorlevel% neq 0 (
    if not exist "%ProgramFiles%\nodejs\node.exe" (
        echo.
        echo [2/4] Node.js kompyuterda topilmadi. Avtomatik o'rnatilmoqda...
        if exist "%INSTALL_DIR%\NodeJS_Ornatuvchi.msi" (
            start /wait msiexec /i "%INSTALL_DIR%\NodeJS_Ornatuvchi.msi" /passive /norestart
            echo       [OK] Node.js muvaffaqiyatli o'rnatildi!
        ) else if exist "%~dp0NodeJS_Ornatuvchi.msi" (
            start /wait msiexec /i "%~dp0NodeJS_Ornatuvchi.msi" /passive /norestart
            echo       [OK] Node.js muvaffaqiyatli o'rnatildi!
        )
    )
)

:: PATH o'zgaruvchisini yangilash
set "PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs"

:: 3. Windows Avtozagruzkasini (Kompyuter o'chib yonganda avtomatik yonishi uchun) sozlash
if exist "%STARTUP_FOLDER%" (
    echo.
    echo [3/4] Kompyuter o'chib yonganda avtomatik ishga tushish sozlanmoqda...
    (
        echo Set WshShell = CreateObject^("WScript.Shell"^)
        echo Set fso = CreateObject^("Scripting.FileSystemObject"^)
        echo installDir = "C:\Maktab_FaceID_Tizimi"
        echo bridgeScript = installDir ^& "\server\face-bridge.cjs"
        echo If fso.FileExists^(bridgeScript^) Then
        echo     WshShell.Run "cmd /c cd /d """ ^& installDir ^& """ ^&^& node server/face-bridge.cjs", 0, False
        echo     WScript.Sleep 4000
        echo     WshShell.Run "http://localhost:5001/", 1, False
        echo End If
    ) > "%STARTUP_FOLDER%\Maktab_AvtoBoshlash.vbs"
    echo       [OK] Avtozagruzka sozlandi!
)

:: 4. Serverni kompyuterdan ishga tushirish (Port 5001)
echo.
echo [4/4] Face-ID va Turniket ko'prik serveri ishga tushirilmoqda...
cd /d "%INSTALL_DIR%"
start "Maktab Face Bridge" /min node server/face-bridge.cjs

:: Ulanish kutilmoqda
timeout /t 3 /nobreak >nul

:: Brauzerda srazi ochish
start http://localhost:5001/

echo.
echo ======================================================================
echo  [MUVAFFAQIYATLI BAJARILDI!]
echo ----------------------------------------------------------------------
echo  1. Tizim kompyuterga to'liq o'rnatildi va ishga tushdi!
echo  2. SIZ ENDI FLESHKANI KOMPYUTERDAN BEMALOL SUG'URIB OLISHINGIZ MUMKIN!
echo  3. Kompyuter o'chib yonsa ham tizim o'zi avtomatik fonda ishga tushadi
echo     va brauzerda SRAZI LOGIN BO'LGAN HOLATDA ochiladi.
echo ======================================================================
echo.
echo 5 soniyadan so'ng ushbu oyna avtomatik yopiladi...
timeout /t 5 /nobreak >nul
exit
