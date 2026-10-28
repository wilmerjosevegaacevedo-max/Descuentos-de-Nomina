@echo off
chcp 65001 > nul
echo =======================================================
echo Iniciando Motor RPA LAD-6819 (TypeScript / Node.js)
echo =======================================================
echo Fecha y hora de inicio: %date% %time%
echo.

cd /d "%~dp0frontend"
call npm run rpa

echo.
echo =======================================================
echo Proceso finalizado a las %time%
echo =======================================================