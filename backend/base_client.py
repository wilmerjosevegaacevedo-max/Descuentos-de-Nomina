"""
base_client.py
Clase abstracta BaseClient.
Define la plantilla (Template Method) y las utilidades comunes para procesar 
los archivos de cada cliente del RPA.
"""

import os
import zipfile
from datetime import datetime
from pathlib import Path
from abc import ABC, abstractmethod

import pandas as pd

from registro_log import get_logger
from ConexionFtp import ConexionFtp
from config.environment import env

logger = get_logger()

class BaseClient(ABC):
    """
    Clase base para todos los procesadores de clientes.
    Maneja la creación de carpetas por lote (batch), empaquetado ZIP, 
    lectura/escritura de Excel y carga FTP.
    """

    def __init__(self, nombre_cliente: str):
        self.nombre_cliente = nombre_cliente
        # Generar un ID único de lote basado en la fecha y hora
        self.batch_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Ruta de trabajo temporal: files/<nombre_cliente>/<batch_id>
        self.work_dir = Path(env.files_base_path) / self.nombre_cliente / self.batch_id
        self.archivos_generados = []

    def preparar_entorno(self):
        """Crea la estructura de carpetas local para el procesamiento actual."""
        self.work_dir.mkdir(parents=True, exist_ok=True)
        logger.debug(f"[{self.nombre_cliente}] Directorio de trabajo preparado: {self.work_dir}")

    def empaquetar_archivos(self) -> str:
        """
        Comprime todos los archivos generados en la carpeta de trabajo en un único archivo .ZIP
        Retorna la ruta del archivo ZIP generado.
        """
        if not self.archivos_generados:
            logger.warning(f"[{self.nombre_cliente}] No hay archivos nuevos para empaquetar.")
            return ""

        zip_filename = f"{self.nombre_cliente}_procesado_{self.batch_id}.zip"
        # El ZIP se guarda un nivel arriba de la carpeta temporal (en la carpeta del cliente)
        zip_path = self.work_dir.parent / zip_filename

        logger.info(f"[{self.nombre_cliente}] Empaquetando {len(self.archivos_generados)} archivos en {zip_filename}")
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(self.work_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Añadir al ZIP sin toda la ruta absoluta del sistema
                    arcname = os.path.relpath(file_path, self.work_dir)
                    zipf.write(file_path, arcname)

        logger.success(f"[{self.nombre_cliente}] ZIP generado exitosamente en: {zip_path}")
        return str(zip_path)

    def enviar_ftp(self, archivo_local: str, subcarpeta_remota: str = "") -> bool:
        """
        Sube el archivo final al servidor FTP usando la clase ConexionFtp.
        """
        if not archivo_local or not Path(archivo_local).exists():
            logger.error(f"[{self.nombre_cliente}] Archivo local no válido para FTP: {archivo_local}")
            return False

        logger.info(f"[{self.nombre_cliente}] Iniciando transferencia FTP...")
        with ConexionFtp() as ftp:
            nombre_archivo = Path(archivo_local).name
            
            # Construir ruta remota (ej: /clientes/continental/archivo.zip)
            ruta_remota = f"{env.ftp_remote_path}/{subcarpeta_remota}/{nombre_archivo}"
            ruta_remota = ruta_remota.replace("//", "/") # Limpiar dobles slashes
            
            return ftp.subir_archivo(archivo_local, ruta_remota)

    def leer_excel(self, ruta_archivo: str, **kwargs) -> pd.DataFrame:
        """Utilidad estándar para leer archivos Excel con pandas y capturar errores."""
        try:
            logger.debug(f"[{self.nombre_cliente}] Leyendo Excel: {Path(ruta_archivo).name}")
            return pd.read_excel(ruta_archivo, **kwargs)
        except Exception as e:
            logger.error(f"[{self.nombre_cliente}] Error leyendo Excel {ruta_archivo}: {e}")
            raise

    def guardar_excel(self, df: pd.DataFrame, nombre_archivo: str, **kwargs) -> str:
        """
        Guarda un DataFrame en la carpeta de trabajo del lote actual 
        y lo registra para ser comprimido.
        """
        ruta_salida = self.work_dir / nombre_archivo
        try:
            df.to_excel(ruta_salida, index=False, **kwargs)
            logger.debug(f"[{self.nombre_cliente}] Archivo generado: {nombre_archivo}")
            self.archivos_generados.append(str(ruta_salida))
            return str(ruta_salida)
        except Exception as e:
            logger.error(f"[{self.nombre_cliente}] Error al guardar Excel {nombre_archivo}: {e}")
            raise

    @abstractmethod
    def procesar(self, archivo_entrada: str) -> bool:
        """
        MÉTODO ABSTRACTO: Cada cliente debe implementar este método.
        Aquí reside la lógica de negocio, mapeo y cálculos de cada empresa.
        Retorna True si el procesamiento fue exitoso.
        """
        pass

    def run(self, archivo_entrada: str) -> dict:
        """
        Template Method: Define el flujo estándar de ejecución del RPA.
        Cualquier cliente sigue estos mismos pasos organizados.
        """
        logger.seccion(f"iniciando cliente: {self.nombre_cliente.upper()}")
        logger.info(f"[{self.nombre_cliente}] Archivo de entrada: {Path(archivo_entrada).name}")
        
        resultado = {
            "cliente": self.nombre_cliente,
            "batch_id": self.batch_id,
            "exito": False,
            "archivo_zip": None,
            "error": None
        }

        try:
            # 1. Crear directorios
            self.preparar_entorno()
            
            # 2. Ejecutar la lógica de negocio (implementada por cada cliente)
            exito_proceso = self.procesar(archivo_entrada)
            
            if not exito_proceso:
                logger.error(f"[{self.nombre_cliente}] La lógica de negocio retornó fallo.")
                resultado["error"] = "Fallo en el método procesar()"
                return resultado
                
            # 3. Empaquetar resultados
            ruta_zip = self.empaquetar_archivos()
            if ruta_zip:
                resultado["archivo_zip"] = ruta_zip
                
            resultado["exito"] = True
            logger.success(f"[{self.nombre_cliente}] Flujo completado exitosamente.")
            
        except Exception as e:
            logger.critical(f"[{self.nombre_cliente}] Error no controlado en la ejecución: {e}")
            resultado["error"] = str(e)
            
        return resultado
