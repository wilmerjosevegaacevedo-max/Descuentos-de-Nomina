import pandas as pd
from base_client import BaseClient
from registro_log import get_logger
from datetime import datetime

logger = get_logger()

class ClienteCDF(BaseClient):
    def __init__(self):
        super().__init__(nombre_cliente="cdf")
        
    def procesar(self, archivo_entrada: str) -> bool:
        logger.info("[CDF] Iniciando validación y transformación de datos...")
        
        # 1. LECTURA DEL ARCHIVO
        df = self.leer_excel(archivo_entrada)
        
        # =========================================================
        # 2. REGLAS DE VALIDACIÓN (Si fallan, envían correo ROJO)
        # =========================================================
        columnas_requeridas = [
            "Costo Empleado ", "Nivel", "Apellido Paterno", 
            "Apellido Materno", "Nombre (s)", "Employees Number ID (ATTUID)", 
            "Producto"
        ]
        
        # Regla A: Que no falten columnas
        faltantes = [col for col in columnas_requeridas if col not in df.columns]
        if faltantes:
            # Esta línea detiene el bot y envía el correo rojo
            raise ValueError(f"Archivo rechazado. El layout es incorrecto, faltan las siguientes columnas: {', '.join(faltantes)}")
            
        # Regla B: Que el costo no venga vacío
        if df["Costo Empleado "].isnull().any():
            raise ValueError("Rechazado. Se encontraron celdas en blanco en la columna 'Costo Empleado '. Corrija el archivo y vuelva a enviarlo.")
            
            
        # =========================================================
        # 3. LÓGICA DE TRANSFORMACIÓN (Basado en tu código original)
        # =========================================================
        # Filtrar costos mayores a cero
        df = df[df["Costo Empleado "] > 0].copy()
        
        # Limpieza de textos
        df["Apellido Paterno"] = df["Apellido Paterno"].fillna("").astype(str)
        df["Apellido Materno"] = df["Apellido Materno"].fillna("").astype(str)
        df["Nombre (s)"] = df["Nombre (s)"].fillna("").astype(str)
        
        # Renombrar columnas
        df.rename(columns={
            "Employees Number ID (ATTUID)": "NUMERO DE EMPLEADO"
        }, inplace=True)
        
        # (Nota: Aquí iría tu lógica de pd.merge si cargaras los catálogos adicionales)
        
        # =========================================================
        # 4. EXPORTAR EXCEL FINAL (Para ser metido en el ZIP)
        # =========================================================
        fecha_ej = datetime.now().strftime("%Y%m%d")
        nombre_salida = f"CDF_Layout_Procesado_{fecha_ej}.xlsx"
        
        self.guardar_excel(df, nombre_salida)
        
        logger.info(f"[CDF] Transformación completada. {len(df)} registros válidos.")
        return True
