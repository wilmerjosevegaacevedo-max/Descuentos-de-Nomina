"""
Módulo de cálculo financiero y deducciones para el RPA LAD-6819.

Implementa el componente CalculadorDescuentos que procesa salarios,
descuentos de seguro de Vida, GMM, Costo Empleado Anual y Costo Empresa Anual.
"""

from typing import Dict, Any, List
from src.base import ComponenteRPA


class CalculadorDescuentos(ComponenteRPA):
    """
    Componente encargado de ejecutar los cálculos financieros de la nómina.

    Calcula:
        - Descuento Seguro de Vida
        - Descuento Gastos Médicos Mayores (GMM)
        - Costo Empleado Anual
        - Costo Empresa Anual
    """

    TARIFAS_VIDA: Dict[str, float] = {
        "COBERTURA_BÁSICA": 35000.0,
        "COBERTURA_PREMIUM": 85000.0,
        "SIN_PLAN": 0.0
    }

    TARIFAS_GMM: Dict[str, float] = {
        "BÁSICO": 120000.0,
        "EJECUTIVO": 280000.0,
        "SIN_PLAN": 0.0
    }

    FACTOR_CARGA_PRESTACIONAL_EMPRESA: float = 0.52  # 52% prestaciones + seguridad social

    def __init__(self, nombre: str = "Calculador de Descuentos y Costos") -> None:
        super().__init__(nombre)

    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Realiza los cálculos por cada empleado y consolida los totales en el contexto.

        Args:
            contexto (Dict[str, Any]): Debe incluir 'datos_nomina_raw'.

        Returns:
            Dict[str, Any]: Contexto con la lista 'datos_nomina_procesada' y los totales.
        """
        registros_raw: List[Dict[str, Any]] = contexto.get("datos_nomina_raw", [])
        if not registros_raw:
            raise ValueError("No existen datos de nómina validados en el contexto para calcular.")

        registros_procesados: List[Dict[str, Any]] = []
        total_costo_empleado_anual: float = 0.0
        total_costo_empresa_anual: float = 0.0

        for registro in registros_raw:
            salario_mensual = float(registro.get("salario_mensual", 0.0))
            plan_vida = registro.get("plan_vida", "SIN_PLAN")
            plan_gmm = registro.get("plan_gmm", "SIN_PLAN")

            desc_vida_mensual = self.TARIFAS_VIDA.get(plan_vida, 0.0)
            desc_gmm_mensual = self.TARIFAS_GMM.get(plan_gmm, 0.0)
            total_descuentos_mensual = desc_vida_mensual + desc_gmm_mensual

            salario_neto_mensual = salario_mensual - total_descuentos_mensual

            # Costos anuales
            costo_empleado_anual = (salario_mensual * 12) - (total_descuentos_mensual * 12)
            costo_empresa_anual = (salario_mensual * 12 * (1 + self.FACTOR_CARGA_PRESTACIONAL_EMPRESA)) + (desc_gmm_mensual * 12 * 0.5)

            total_costo_empleado_anual += costo_empleado_anual
            total_costo_empresa_anual += costo_empresa_anual

            registro_calc = {
                **registro,
                "descuento_vida_mensual": desc_vida_mensual,
                "descuento_gmm_mensual": desc_gmm_mensual,
                "total_descuentos_mensual": total_descuentos_mensual,
                "salario_neto_mensual": salario_neto_mensual,
                "costo_empleado_anual": costo_empleado_anual,
                "costo_empresa_anual": costo_empresa_anual
            }
            registros_procesados.append(registro_calc)

        contexto["datos_nomina_procesada"] = registros_procesados
        contexto["totales_resumen"] = {
            "total_costo_empleado_anual": total_costo_empleado_anual,
            "total_costo_empresa_anual": total_costo_empresa_anual,
            "total_empleados": len(registros_procesados)
        }

        return contexto
