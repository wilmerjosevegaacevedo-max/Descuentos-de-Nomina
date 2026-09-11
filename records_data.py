"""
records_data.py
Bitácora (Tracker) de procesos para el RPA LAD-6819.
Almacena un registro en JSON de los correos/archivos ya procesados
para evitar duplicidad en caso de reinicios o errores.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from registro_log import get_logger
from services.firebase_service import guardar_log_nube

logger = get_logger()

class ProcessTracker:
    """
    Sistema de seguimiento persistente (JSON) para evitar re-procesamiento.
    """
    
    def __init__(self, filepath: str = "data/records.json"):
        self.filepath = Path(filepath)
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        self._asegurar_archivo()
        
    def _asegurar_archivo(self):
        """Crea el archivo JSON inicial si no existe."""
        if not self.filepath.exists():
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump({"procesados": []}, f, indent=4)
                
    def _leer_registros(self) -> dict:
        """Lee el contenido actual de la bitácora JSON."""
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error al leer la bitácora {self.filepath}: {e}")
            return {"procesados": []}
            
    def _guardar_registros(self, data: dict):
        """Sobrescribe el archivo JSON con los nuevos datos."""
        try:
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error al guardar en la bitácora {self.filepath}: {e}")

    def ya_fue_procesado(self, item_id: str) -> bool:
        """
        Verifica si un ID único ya existe en el registro y si fue EXITOSO.
        """
        if not item_id:
            return False
            
        data = self._leer_registros()
        procesados = data.get("procesados", [])
        
        for registro in procesados:
            if registro.get("id") == item_id and registro.get("estado") == "EXITOSO":
                return True
        return False

    def registrar_proceso(self, item_id: str, cliente: str, asunto: str, estado: str, mensaje: str = ""):
        """
        Añade o actualiza el registro de un correo/proceso en la bitácora.
        """
        if not item_id:
            return
            
        data = self._leer_registros()
        procesados = data.get("procesados", [])
        
        nuevo_registro = {
            "id": item_id,
            "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "cliente": cliente,
            "asunto": asunto,
            "estado": estado,
            "mensaje": mensaje
        }
        
        # Si el ID ya existe (ej. falló antes y ahora se reintenta), lo actualizamos.
        actualizado = False
        for i, registro in enumerate(procesados):
            if registro.get("id") == item_id:
                procesados[i] = nuevo_registro
                actualizado = True
                break
                
        if not actualizado:
            procesados.append(nuevo_registro)
            
        data["procesados"] = procesados
        self._guardar_registros(data)
        logger.debug(f"Bitácora actualizada -> ID: {item_id[:15]}... | Cliente: {cliente} | Estado: {estado}")
        guardar_log_nube(item_id, cliente, estado, mensaje)
