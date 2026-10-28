"""
utils.py
Funciones utilitarias compartidas por todo el proyecto RPA.
Incluye carga de configuración, normalización de textos y limpieza de temporales.
"""

import yaml
import os
import re
import time
import unicodedata
from pathlib import Path
from registro_log import get_logger

logger = get_logger()

def cargar_configuracion_yaml(ruta_archivo: str = "layout_config.yaml") -> dict:
    """Lee y carga el archivo de configuración YAML."""
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
            return config
    except Exception as e:
        logger.error(f"Error al cargar archivo YAML {ruta_archivo}: {e}")
        return {}

def normalizar_texto(texto: str) -> str:
    """
    Limpia un texto: elimina acentos, pasa a minúsculas y quita espacios extra.
    Muy útil para comparar asuntos de correos, nombres de clientes o columnas.
    """
    if not isinstance(texto, str):
        return str(texto)
    # Eliminar tildes/acentos
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    # Minúsculas y espacios
    texto = texto.lower().strip()
    # Reemplazar múltiples espacios por uno solo
    texto = re.sub(r'\s+', ' ', texto)
    return texto

def identificar_cliente(asunto: str, remitente: str, config: dict) -> str:
    """
    Identifica a qué cliente pertenece un correo utilizando las reglas del YAML.
    Prioridad: 
    1. Por dominio del remitente.
    2. Por palabras clave en el asunto.
    """
    asunto_norm = normalizar_texto(asunto)
    remitente_norm = normalizar_texto(remitente)
    
    clientes = config.get("clientes", {})
    
    for nombre_cli, reglas in clientes.items():
        if not reglas.get("activo", False):
            continue
            
        deteccion = reglas.get("deteccion", {})
        palabras_clave = deteccion.get("palabras_clave_asunto", [])
        dominios = deteccion.get("dominios_remitente", [])
        
        # Regla 1: Coincidencia por dominio del remitente
        for dominio in dominios:
            if normalizar_texto(dominio) in remitente_norm:
                logger.debug(f"Cliente '{nombre_cli.upper()}' identificado por dominio de remitente.")
                return nombre_cli
                
        # Regla 2: Coincidencia por asunto del correo
        for palabra in palabras_clave:
            if normalizar_texto(palabra) in asunto_norm:
                logger.debug(f"Cliente '{nombre_cli.upper()}' identificado por palabras clave en asunto.")
                return nombre_cli

    logger.warning(f"No se pudo identificar un cliente para el correo de '{remitente}' con asunto: '{asunto}'")
    return None

def limpiar_archivos_temporales(directorio_base: str = "files", dias_antiguedad: int = 7) -> None:
    """
    Elimina carpetas temporales de procesamiento más antiguas que N días
    para evitar llenar el disco del servidor.
    """
    try:
        dir_path = Path(directorio_base)
        if not dir_path.exists():
            return
            
        ahora = time.time()
        archivos_borrados = 0
        
        for root, dirs, files in os.walk(directorio_base, topdown=False):
            # Omitir la carpeta de plantillas de correo para no borrarlas por accidente
            if "templates" in root.lower():
                continue
                
            # Borrar archivos viejos
            for name in files:
                ruta_archivo = os.path.join(root, name)
                if os.stat(ruta_archivo).st_mtime < ahora - (dias_antiguedad * 86400):
                    os.remove(ruta_archivo)
                    archivos_borrados += 1
            # Borrar directorios que quedaron vacíos
            for name in dirs:
                ruta_dir = os.path.join(root, name)
                if not os.listdir(ruta_dir):
                    os.rmdir(ruta_dir)
                    
        if archivos_borrados > 0:
            logger.info(f"Mantenimiento: Se eliminaron {archivos_borrados} archivos temporales (>{dias_antiguedad} días).")
            
    except Exception as e:
        logger.error(f"Error durante el mantenimiento de archivos temporales: {e}")
