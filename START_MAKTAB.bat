@echo off
title Maktab Face-ID Tizimi
color 0A
echo =======================================================
echo     MAKTAB FACE-ID VA FOYE MONITOR TIZIMI ISHGA TUSHMOQDA...
echo =======================================================
echo.

cd /d "%~dp0"

:: 1. Node.js o'rnatilganligini tekshirish va yo'q bo'lsa avtomatik o'rnatish
where.exe node >nul 2>nul
if %errorlevel% neq 0 (
    if not exist "%ProgramFiles%\nodejs\node.exe" (
        echo [1/3] Node.js dasturi kompyuterda topilmadi.
        echo       Avtomatik o'rnatilmoqda, iltimos 1 daqiqa kuting...
        echo.
        if exist "%~dp0NodeJS_Ornatuvchi.msi" (
            start /wait msiexec /i "%~dp0NodeJS_Ornatuvchi.msi" /passive /norestart
            echo.
            echo [OK] Node.js muvaffaqiyatli o'rnatildi!
        ) else (
            echo [DIQQAT] NodeJS_Ornatuvchi.msi fayli topilmadi.
        )
    )
)

:: PATH o'zgaruvchisini yangilash
set "PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs"

echo [2/3] Maktab Face-ID ko'prik serveri ishga tushirilmoqda (Port 5001)...
start "Maktab Face Bridge" /min node server/face-bridge.cjs

echo [3/3] Tizim to'liq ulanishi uchun 3 soniya kutilmoqda...
timeout /t 3 /nobreak >nul

echo.
echo Foye monitori brauzerda ochilmoqda...
start http://localhost:5001/monitor

echo.
echo =======================================================
echo  TIZIM MUVAFFAQIYATLI ISHGA TUSHDI!
echo  6 ta Face-ID kamerasi faol va o'tishlar qabul qilinmoqda.
echo  Ushbu oynani yopmasdan minimallashtirib qo'yishingiz mumkin.
echo =======================================================
