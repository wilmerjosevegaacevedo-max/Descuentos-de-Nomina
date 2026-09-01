@echo off
chcp 65001 > nul
echo =======================================================
echo Iniciando Orquestador RPA LAD-6819
echo =======================================================
echo Fecha y hora de inicio: %date% %time%
echo.

:: Forzar a Windows a ubicarse en la carpeta correcta del proyecto
cd /d "C:\Users\wilme\.gemini\antigravity-ide\scratch\rpa_lad_6819"

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo Ejecutando motor principal (main.py)...
python main.py

echo.
echo =======================================================
echo Proceso finalizado a las %time%
echo =======================================================
