@echo off
chcp 65001 > nul
echo =======================================================
echo Iniciando Orquestador RPA LAD-6819
echo =======================================================
echo Fecha y hora de inicio: %date% %time%
echo.

:: Ubicarse dinámicamente en la carpeta del backend
cd /d "%~dp0"

echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo Ejecutando motor principal (main.py)...
python main.py

echo.
echo =======================================================
echo Proceso finalizado a las %time%
echo =======================================================
