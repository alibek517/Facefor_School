@echo off
title Maktab Face-ID Tizimi
color 0A
echo =======================================================
echo     MAKTAB FACE-ID VA FOYE MONITOR TIZIMI ISHGA TUSHMOQDA...
echo =======================================================
echo.

cd /d "%~dp0"

echo 1. Maktab Face-ID ko'prik serveri ishga tushirilmoqda (Port 5001)...
start "Maktab Face Bridge" /min node server/face-bridge.cjs

echo 2. Tizim to'liq ulanishi uchun 3 soniya kutilmoqda...
timeout /t 3 /nobreak >nul

echo 3. Foye monitori brauzerda to'liq hajmda ochilmoqda...
start http://localhost:5001/monitor

echo.
echo =======================================================
echo  TIZIM MUVAFFAQIYATLI ISHGA TUSHDI!
echo  6 ta Face-ID kamerasi faol va o'tishlar qabul qilinmoqda.
echo  Ushbu qora oynani yopmasdan minimallashtirib qo'yishingiz mumkin.
echo =======================================================
