"""
ConexionFtp.py
Módulo para manejar las conexiones y transferencias por FTP.
Implementa reconexión automática, manejo de errores y soporte para Context Manager (with).
"""

import os
import ftplib
import time
from pathlib import Path
from registro_log import get_logger
from config.environment import env

logger = get_logger()

class ConexionFtp:
    """
    Clase para manejar la conexión FTP con el cliente.
    Lee automáticamente las credenciales desde las variables de entorno.
    """

    def __init__(self, host=None, user=None, password=None, port=None):
        self.host = host or env.ftp_host
        self.user = user or env.ftp_user
        self.password = password or env.ftp_password
        self.port = port or env.ftp_port
        
        self.ftp = None
        self.max_reintentos = 3
        self.tiempo_espera = 5  # Segundos entre reintentos

    def conectar(self):
        """Establece la conexión FTP con reintentos automáticos."""
        if not self.host or not self.user or not self.password:
            logger.error("Credenciales FTP incompletas. Verifica el archivo .env")
            raise ValueError("Faltan credenciales FTP")

        intentos = 0
        while intentos < self.max_reintentos:
            try:
                logger.info(f"Conectando a FTP: {self.host}:{self.port} (Intento {intentos + 1}/{self.max_reintentos})")
                self.ftp = ftplib.FTP()
                self.ftp.connect(self.host, self.port, timeout=30)
                self.ftp.login(self.user, self.password)
                logger.info("✅ Conexión FTP establecida con éxito.")
                return True
            except ftplib.all_errors as e:
                intentos += 1
                logger.warning(f"Error de conexión FTP: {e}. Reintentando en {self.tiempo_espera}s...")
                time.sleep(self.tiempo_espera)
        
        logger.error(f"❌ No se pudo establecer conexión FTP tras {self.max_reintentos} intentos.")
        return False

    def desconectar(self):
        """Cierra la conexión FTP de forma segura."""
        if self.ftp:
            try:
                self.ftp.quit()
                logger.info("Conexión FTP cerrada correctamente.")
            except Exception as e:
                self.ftp.close()
                logger.warning(f"Conexión FTP cerrada forzosamente: {e}")
            finally:
                self.ftp = None

    def subir_archivo(self, ruta_local: str, ruta_remota: str) -> bool:
        """
        Sube un archivo local al servidor FTP.
        
        Args:
            ruta_local (str): Ruta completa del archivo local a subir.
            ruta_remota (str): Nombre o ruta destino en el servidor FTP.
        """
        path_local = Path(ruta_local)
        
        if not path_local.exists():
            logger.error(f"El archivo local no existe: {ruta_local}")
            return False

        if not self.ftp:
            exito_conexion = self.conectar()
            if not exito_conexion:
                return False

        try:
            logger.info(f"Iniciando subida FTP: {path_local.name} -> {ruta_remota}")
            with open(path_local, 'rb') as archivo:
                # Usar STOR para subir el archivo binario
                self.ftp.storbinary(f'STOR {ruta_remota}', archivo)
            
            logger.info(f"✅ Archivo subido exitosamente a FTP: {ruta_remota}")
            return True
            
        except ftplib.all_errors as e:
            logger.error(f"❌ Error al subir archivo por FTP: {e}")
            # Si el error es de conexión, forzamos desconexión para limpiar estado
            self.desconectar()
            return False

    def listar_directorio(self, ruta_remota: str = "") -> list:
        """Lista los archivos de un directorio en el FTP"""
        if not self.ftp:
            if not self.conectar():
                return []
                
        try:
            if ruta_remota:
                self.ftp.cwd(ruta_remota)
            archivos = self.ftp.nlst()
            return archivos
        except ftplib.all_errors as e:
            logger.error(f"Error al listar directorio FTP: {e}")
            return []

    # --- Soporte para Context Manager (with) ---
    def __enter__(self):
        self.conectar()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.desconectar()
