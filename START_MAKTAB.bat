@echo off
title Maktab Face-ID Tizimi
color 0A
echo =======================================================
echo     MAKTAB FACE-ID VA FOYE MONITOR TIZIMI ISHGA TUSHMOQDA...
echo =======================================================
echo.

cd /d "%~dp0"

echo 1. Ko'prik serveri ishga tushirilmoqda (Port 5001)...
start "Maktab Face Bridge" /min node server/face-bridge.cjs

echo 2. Frontend server ishga tushirilmoqda (Port 3000)...
start "Maktab Web" /min npm run dev

echo 3. Tizim to'liq ishga tushishi uchun 4 soniya kutilmoqda...
timeout /t 4 /nobreak >nul

echo 4. Foye monitori brauzerda to'liq ekranda ochilmoqda...
start http://localhost:3000/monitor

echo.
echo =======================================================
echo  TIZIM MUVAFFAQIYATLI ISHGA TUSHDI!
echo  Ushbu oynani yopmasdan minimallashtirib qo'yishingiz mumkin.
echo =======================================================
