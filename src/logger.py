"""
Módulo de registro y trazabilidad para el sistema RPA LAD-6819.

Proporciona la clase GestorLogs para el formateo e impresión en consola
así como la persistencia de registros en archivo de texto dentro de data/logs/.
"""

import os
from datetime import datetime
from pathlib import Path


class GestorLogs:
    """
    Gestor centralizado de registros y auditoría de ejecución para el RPA.

    Attributes:
        directorio_logs (Path): Ruta al directorio donde se almacenan los archivos de logs.
    """

    def __init__(self, ruta_logs: str = "data/logs") -> None:
        """
        Inicializa el GestorLogs y asegura la creación del directorio objetivo.

        Args:
            ruta_logs (str): Ruta relativa o absoluta para almacenar los logs.
        """
        self.directorio_logs: Path = Path(ruta_logs)
        self._preparar_directorio()

    def _preparar_directorio(self) -> None:
        """Crea el directorio de logs si no existe."""
        self.directorio_logs.mkdir(parents=True, exist_ok=True)

    def registrar(self, mensaje: str, nivel: str = "INFO") -> None:
        """
        Registra un mensaje formateado en consola y lo guarda en el archivo de log del día.

        Args:
            mensaje (str): Contenido o descripción del evento a registrar.
            nivel (str, optional): Nivel del log (INFO, WARNING, ERROR, CRITICAL, DEBUG).
                                   Por defecto "INFO".
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        nivel_upper = nivel.upper()
        linea_log = f"[{timestamp}] [{nivel_upper}] {mensaje}"

        # Salida a consola
        print(linea_log)

        # Persistencia en archivo por fecha
        nombre_archivo = f"rpa_lad_6819_{datetime.now().strftime('%Y%m%d')}.log"
        ruta_archivo = self.directorio_logs / nombre_archivo

        try:
            with open(ruta_archivo, mode="a", encoding="utf-8") as file:
                file.write(linea_log + "\n")
        except Exception as err:
            print(f"[{timestamp}] [ERROR_LOGGER] No se pudo escribir en log: {err}")
