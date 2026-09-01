"""
Cliente CDF
Ejemplo de lógica específica para el cliente CDF.
"""
from base_client import BaseClient
from registro_log import get_logger

logger = get_logger()

class ClienteCDF(BaseClient):
    def __init__(self):
        super().__init__(nombre_cliente="cdf")

    def procesar(self, archivo_entrada: str) -> bool:
        """
        Lógica de negocio específica para CDF.
        - Lee el archivo.
        - Renombra columnas (ej. 'CEDULA' a 'ID_EMPLEADO').
        - Filtra empleados inactivos.
        """
        logger.info("[CDF] Iniciando transformación de datos...")
        try:
            # 1. Leer el Excel
            df = self.leer_excel(archivo_entrada)
            
            # 2. Transformaciones (Ejemplo ficticio)
            if 'CEDULA' in df.columns:
                df = df.rename(columns={'CEDULA': 'ID_EMPLEADO'})
            
            # 3. Filtrar
            if 'ESTADO' in df.columns:
                df = df[df['ESTADO'] == 'ACTIVO']
                
            # 4. Guardar archivo resultante
            nombre_salida = f"CDF_Layout_Procesado_{self.batch_id}.xlsx"
            self.guardar_excel(df, nombre_salida)
            
            logger.info(f"[CDF] Transformación completada. {len(df)} registros válidos.")
            return True
            
        except Exception as e:
            logger.error(f"[CDF] Error en lógica de negocio: {e}")
            return False
