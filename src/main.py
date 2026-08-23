"""
Módulo principal del orquestador (MotorRPA) para el proyecto RPA LAD-6819.

Este archivo coordina la ejecución secuencial de la lista de componentes (pipeline)
para Blacksmith Research Colombia SAS.
"""

from typing import List, Dict, Any
from pathlib import Path
from src.base import ComponenteRPA
from src.logger import GestorLogs
from src.validaciones import ValidadorNomina
from src.calculos import CalculadorDescuentos
from src.exportador import ExportadorLayouts
from src.notificador import NotificadorEmail


class MotorRPA:
    """
    Orquestador principal del proceso de automatización RPA LAD-6819.

    Attributes:
        logger (GestorLogs): Instancia del gestor de trazabilidad y logs.
        pipeline (List[ComponenteRPA]): Secuencia ordenada de componentes a ejecutar.
    """

    def __init__(self) -> None:
        """Inicializa el motor RPA, su sistema de logs y el pipeline de ejecución."""
        self.logger: GestorLogs = GestorLogs()
        self.pipeline: List[ComponenteRPA] = []

    def registrar_componente(self, componente: ComponenteRPA) -> None:
        """
        Añade un componente a la lista del pipeline de ejecución.

        Args:
            componente (ComponenteRPA): Instancia de un componente que extiende de ComponenteRPA.
        """
        self.pipeline.append(componente)
        self.logger.registrar(
            f"Componente '{componente.nombre}' registrado en el pipeline.", nivel="DEBUG"
        )

    def iniciar_proceso(self, ruta_archivo_entrada: str = "data/input/nomina_entrada.csv") -> Dict[str, Any]:
        """
        Inicia la ejecución secuencial de la lista de componentes dentro del pipeline.

        Maneja un diccionario de contexto global mutable y captura cualquier
        excepción crítica para evitar el colapso abrupto del proceso.

        Args:
            ruta_archivo_entrada (str): Ruta del archivo de nómina a procesar.

        Returns:
            Dict[str, Any]: Diccionario con el contexto final consolidado.
        """
        self.logger.registrar("=== Iniciando Ejecución RPA LAD-6819 ===")
        contexto_global: Dict[str, Any] = {
            "proyecto": "RPA LAD-6819",
            "empresa": "Blacksmith Research Colombia SAS",
            "estado": "EN_PROCESO",
            "ruta_archivo_entrada": ruta_archivo_entrada
        }

        try:
            for componente in self.pipeline:
                if not componente.activo:
                    self.logger.registrar(
                        f"Saltando componente inactivo: {componente.nombre}",
                        nivel="WARNING"
                    )
                    continue

                self.logger.registrar(f"Ejecutando componente: {componente.nombre}...")
                contexto_global = componente.ejecutar(contexto_global)
                self.logger.registrar(
                    f"Componente '{componente.nombre}' ejecutado con éxito.",
                    nivel="INFO"
                )

            contexto_global["estado"] = "FINALIZADO_EXITOSO"
            self.logger.registrar("=== Proceso RPA Finalizado Con Éxito ===")

        except Exception as e:
            contexto_global["estado"] = "ERROR_CRITICO"
            contexto_global["error"] = str(e)
            self.logger.registrar(
                f"Excepción crítica durante la ejecución del pipeline: {e}",
                nivel="CRITICAL"
            )

        return contexto_global


if __name__ == "__main__":
    # Instanciación del MotorRPA y configuración del pipeline completo
    motor = MotorRPA()

    # Adición de los módulos del pipeline en orden de ejecución
    motor.registrar_componente(ValidadorNomina("1. Validación de Nómina"))
    motor.registrar_componente(CalculadorDescuentos("2. Cálculo de Descuentos y Costos Anuales"))
    motor.registrar_componente(ExportadorLayouts("3. Exportación de Layouts y Compresión ZIP"))
    motor.registrar_componente(NotificadorEmail("4. Notificación y Envío de Correo SMTP"))

    # Ejecución del pipeline
    resultado = motor.iniciar_proceso()
    motor.logger.registrar(
        f"Estado final: {resultado.get('estado')} | ZIP generado: {resultado.get('ruta_zip_generado')}",
        nivel="INFO"
    )
