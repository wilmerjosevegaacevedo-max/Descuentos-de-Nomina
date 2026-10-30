@echo off
chcp 65001 > nul
echo =======================================================
echo Iniciando Servidor Backend API (Node.js / TypeScript)
echo =======================================================
echo Puerto: 4000
echo Endpoint Base: http://localhost:4000
echo.
cd /d "%~dp0backend"
call npm run dev
