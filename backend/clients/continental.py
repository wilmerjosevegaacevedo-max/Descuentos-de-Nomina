"""
Cliente Continental
Ejemplo de lógica específica para el cliente Continental.
"""
from base_client import BaseClient
from registro_log import get_logger
import pandas as pd

logger = get_logger()

class ClienteContinental(BaseClient):
    def __init__(self):
        super().__init__(nombre_cliente="continental")

    def procesar(self, archivo_entrada: str) -> bool:
        """
        Lógica de negocio específica para Continental.
        - Elimina filas vacías.
        - Realiza un cálculo de bonos.
        """
        logger.info("[CONTINENTAL] Iniciando transformación de datos...")
        try:
            df = self.leer_excel(archivo_entrada)
            
            # 1. Limpieza básica
            df = df.dropna(how='all')
            
            # 2. Lógica de Bonos
            if 'SALARIO' in df.columns:
                df['SALARIO'] = pd.to_numeric(df['SALARIO'], errors='coerce').fillna(0)
                df['BONO_CALCULADO'] = df['SALARIO'] * 0.05
            
            # 3. Guardar archivo
            nombre_salida = f"Continental_Calculo_{self.batch_id}.xlsx"
            self.guardar_excel(df, nombre_salida)
            
            return True
            
        except Exception as e:
            logger.error(f"[CONTINENTAL] Error en lógica de negocio: {e}")
            return False
