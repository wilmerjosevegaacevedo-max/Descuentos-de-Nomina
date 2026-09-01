@echo off
title RPA LAD-6819 - Ejecutor Automático
echo =======================================================
echo Iniciando Orquestador RPA LAD-6819
echo =======================================================
echo Fecha y hora de inicio: %date% %time%
echo.

:: Cambiar el directorio de trabajo a la ubicación exacta de este archivo .bat
cd /d "%~dp0"

:: Validar que exista el entorno virtual de Python
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] No se encontro el entorno virtual en la carpeta venv\
    echo Por favor crea el entorno con: python -m venv venv
    echo Y luego instala todo con: pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

:: Activar el entorno virtual
echo Activando entorno virtual...
call venv\Scripts\activate.bat

:: Ejecutar el motor principal
echo Ejecutando motor principal (main.py)...
python main.py

:: Desactivar el entorno
call deactivate
echo.
echo =======================================================
echo Proceso finalizado a las %time%
echo =======================================================

:: Quitar el "pause" si lo vas a poner en el Programador de Tareas de Windows (Task Scheduler)
:: pause
