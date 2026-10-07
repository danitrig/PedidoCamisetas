@echo off
title CustomWear Orders - Servidor Local
echo ========================================================
echo    INICIANDO CUSTOMWEAR ORDERS - PEDIDOS DE ROPA
echo ========================================================
echo.
cd /d "%~dp0"
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo No se encontro Python en el sistema. Abriendo directamente en el navegador...
    start "" "%~dp0index.html"
)
pause
