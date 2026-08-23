"""
Módulo base para los componentes del pipeline RPA.

Define la interfaz abstracta que todos los pasos o componentes
del proceso RPA LAD-6819 deben implementar.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class ComponenteRPA(ABC):
    """
    Clase base abstracta para los componentes del sistema RPA LAD-6819.

    Attributes:
        nombre (str): Nombre identificador del componente.
        activo (bool): Estado que indica si el componente se ejecutará en el pipeline.
    """

    def __init__(self, nombre: str) -> None:
        """
        Inicializa una instancia del componente RPA.

        Args:
            nombre (str): Nombre descriptivo del componente.
        """
        self.nombre: str = nombre
        self.activo: bool = True

    @abstractmethod
    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta la lógica central del componente dentro del pipeline.

        Args:
            contexto (Dict[str, Any]): Diccionario de contexto global con datos compartidos.

        Returns:
            Dict[str, Any]: Diccionario de contexto actualizado tras la ejecución del componente.
        """
        pass
