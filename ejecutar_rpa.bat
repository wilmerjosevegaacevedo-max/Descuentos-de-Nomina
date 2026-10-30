@echo off
chcp 65001 > nul
echo =======================================================
echo Iniciando Ciclo del Robot RPA LAD-6819 (TypeScript)
echo =======================================================
echo Fecha y hora de inicio: %date% %time%
echo.

cd /d "%~dp0backend"
call npm run rpa

echo.
echo =======================================================
echo Proceso RPA finalizado a las %time%
echo =======================================================
pause
