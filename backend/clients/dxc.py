"""
Cliente DXC
Ejemplo de lógica específica para el cliente DXC.
"""
from base_client import BaseClient
from registro_log import get_logger

logger = get_logger()

class ClienteDXC(BaseClient):
    def __init__(self):
        super().__init__(nombre_cliente="dxc")

    def procesar(self, archivo_entrada: str) -> bool:
        """
        Lógica de negocio específica para DXC.
        - Genera dos layouts diferentes a partir de un solo archivo (ej. Pago y Deducciones).
        """
        logger.info("[DXC] Iniciando transformación de datos...")
        try:
            df = self.leer_excel(archivo_entrada)
            
            # Layout 1: Pagos Netos
            df_pagos = df[['ID', 'NOMBRE', 'PAGO_NETO']] if 'PAGO_NETO' in df.columns else df.copy()
            self.guardar_excel(df_pagos, f"DXC_Pagos_{self.batch_id}.xlsx")
            
            # Layout 2: Deducciones
            df_deduc = df[['ID', 'NOMBRE', 'IMPUESTOS', 'SEGURO']] if 'IMPUESTOS' in df.columns else df.copy()
            self.guardar_excel(df_deduc, f"DXC_Deducciones_{self.batch_id}.xlsx")
            
            logger.info("[DXC] Se generaron los 2 layouts correctamente.")
            return True
            
        except Exception as e:
            logger.error(f"[DXC] Error en lógica de negocio: {e}")
            return False
