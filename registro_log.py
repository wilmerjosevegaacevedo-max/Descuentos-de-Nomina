"""
registro_log.py
Sistema central de logs para el proyecto RPA.
Patrón Singleton para asegurar una única instancia del logger en toda la app.
"""

import os
import logging
from datetime import datetime
from pathlib import Path
try:
    from colorama import Fore, Style, init as colorama_init
    colorama_init(autoreset=True)
    HAS_COLORAMA = True
except ImportError:
    HAS_COLORAMA = False

# Crear directorio de logs si no existe
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

class LogFormatter(logging.Formatter):
    """Formateador personalizado para dar color a los niveles de log en consola"""
    
    COLORS = {
        logging.DEBUG: Fore.CYAN if HAS_COLORAMA else "",
        logging.INFO: Fore.WHITE if HAS_COLORAMA else "",
        logging.WARNING: Fore.YELLOW if HAS_COLORAMA else "",
        logging.ERROR: Fore.RED if HAS_COLORAMA else "",
        logging.CRITICAL: Fore.RED + Style.BRIGHT if HAS_COLORAMA else ""
    }
    
    def format(self, record):
        color = self.COLORS.get(record.levelno, "")
        reset = Style.RESET_ALL if HAS_COLORAMA else ""
        
        # Formato: [YYYY-MM-DD HH:MM:SS] [NIVEL] - Mensaje
        log_fmt = f"[{self.formatTime(record, '%Y-%m-%d %H:%M:%S')}] {color}[{record.levelname:^8}]{reset} - {record.getMessage()}"
        return log_fmt


class GestorLogs:
    _instancia = None

    def __new__(cls):
        if cls._instancia is None:
            cls._instancia = super(GestorLogs, cls).__new__(cls)
            cls._instancia._configurar_logger()
        return cls._instancia

    def _configurar_logger(self):
        self.logger = logging.getLogger("RPA_LAD_6819")
        self.logger.setLevel(logging.DEBUG)
        
        # Evitar duplicidad de handlers si se instancia varias veces
        if not self.logger.handlers:
            # 1. Handler para consola (con colores)
            console_handler = logging.StreamHandler()
            console_handler.setLevel(logging.DEBUG)
            console_handler.setFormatter(LogFormatter())
            
            # 2. Handler para archivo (rotación diaria simple)
            hoy = datetime.now().strftime("%Y-%m-%d")
            archivo_log = LOG_DIR / f"rpa_{hoy}.log"
            
            file_handler = logging.FileHandler(archivo_log, encoding='utf-8')
            file_handler.setLevel(logging.INFO)
            # Formato plano para el archivo
            file_fmt = logging.Formatter("[%(asctime)s] [%(levelname)s] - %(message)s", "%Y-%m-%d %H:%M:%S")
            file_handler.setFormatter(file_fmt)
            
            self.logger.addHandler(console_handler)
            self.logger.addHandler(file_handler)

    def get_logger(self):
        return self.logger

# Función de conveniencia global
def get_logger():
    """Retorna la instancia del logger configurado"""
    return GestorLogs().get_logger()
