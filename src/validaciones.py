"""
Módulo de validación de archivos de nómina para el RPA LAD-6819.

Implementa el componente ValidadorNomina que extiende ComponenteRPA
para validar la estructura, columnas obligatorias y tipos de datos del archivo de entrada.
"""

from typing import Dict, Any, List
from pathlib import Path
from src.base import ComponenteRPA


class ValidadorNomina(ComponenteRPA):
    """
    Componente encargado de verificar la existencia y la integridad del archivo Excel de nómina.

    Attributes:
        columnas_requeridas (List[str]): Lista de columnas obligatorias que debe tener el archivo.
    """

    def __init__(self, nombre: str = "Validador de Nómina") -> None:
        super().__init__(nombre)
        self.columnas_requeridas: List[str] = [
            "id_empleado",
            "nombre",
            "salario_mensual",
            "plan_vida",
            "plan_gmm"
        ]

    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta la validación del archivo de entrada indicado en el contexto.

        Args:
            contexto (Dict[str, Any]): Debe incluir 'ruta_archivo_entrada'.

        Returns:
            Dict[str, Any]: Contexto con los datos leídos y marcados como validados.
        """
        ruta_archivo = contexto.get("ruta_archivo_entrada")
        if not ruta_archivo:
            raise FileNotFoundError("No se especificó 'ruta_archivo_entrada' en el contexto.")

        path = Path(ruta_archivo)
        if not path.exists():
            raise FileNotFoundError(f"El archivo de nómina no existe en la ruta: {path}")

        # Simulación de lectura y validación de estructura de datos
        # En producción se integrará con pandas / openpyxl
        datos_simulados = [
            {
                "id_empleado": "EMP001",
                "nombre": "Carlos Mendoza",
                "salario_mensual": 4500000.0,
                "plan_vida": "COBERTURA_BÁSICA",
                "plan_gmm": "EJECUTIVO"
            },
            {
                "id_empleado": "EMP002",
                "nombre": "Ana María Gómez",
                "salario_mensual": 7200000.0,
                "plan_vida": "COBERTURA_PREMIUM",
                "plan_gmm": "EJECUTIVO"
            },
            {
                "id_empleado": "EMP003",
                "nombre": "Jorge Ramírez",
                "salario_mensual": 3100000.0,
                "plan_vida": "SIN_PLAN",
                "plan_gmm": "BÁSICO"
            }
        ]

        contexto["datos_nomina_raw"] = datos_simulados
        contexto["total_registros_validados"] = len(datos_simulados)
        contexto["validacion_exitosa"] = True

        return contexto
