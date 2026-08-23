"""
Módulo de lectura y carga de configuración/datos para el proyecto RPA LAD-6819.

Proporciona las clases Configurador y LectorExcel para cargar archivos YAML de configuración
y leer/normalizar archivos de datos Excel en la carpeta data/input/.
"""

import os
from pathlib import Path
from typing import Dict, Any, Union, Optional

import pandas as pd
import yaml

from src.base import ComponenteRPA
from src.logger import GestorLogs


class Configurador(ComponenteRPA):
    """
    Componente encargado de cargar el archivo de configuración YAML del sistema.

    Attributes:
        ruta_config (Path): Ruta al archivo YAML de configuración.
    """

    def __init__(
        self,
        nombre: str = "Configurador",
        ruta_config: Union[str, Path] = "config/Layout_Config.yaml"
    ) -> None:
        """
        Inicializa la instancia del Configurador.

        Args:
            nombre (str): Nombre descriptivo del componente. Por defecto "Configurador".
            ruta_config (Union[str, Path]): Ruta al archivo YAML de configuración.
        """
        super().__init__(nombre)
        self.ruta_config: Path = Path(ruta_config)

    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Carga el archivo de configuración YAML y guarda el diccionario de reglas
        en contexto['configuraciones'].

        Args:
            contexto (Dict[str, Any]): Diccionario de contexto global del pipeline.

        Returns:
            Dict[str, Any]: Diccionario de contexto actualizado.
        """
        gestor_logs: Optional[GestorLogs] = contexto.get("logger")

        if gestor_logs:
            gestor_logs.registrar(
                f"Cargando archivo de configuración desde: {self.ruta_config}",
                nivel="INFO"
            )

        if not self.ruta_config.exists():
            mensaje_err = f"El archivo de configuración no existe en la ruta: {self.ruta_config}"
            if gestor_logs:
                gestor_logs.registrar(mensaje_err, nivel="ERROR")
            raise FileNotFoundError(mensaje_err)

        with open(self.ruta_config, mode="r", encoding="utf-8") as file:
            configuraciones = yaml.safe_load(file) or {}

        contexto["configuraciones"] = configuraciones

        if gestor_logs:
            gestor_logs.registrar(
                "Configuración YAML cargada exitosamente.",
                nivel="INFO"
            )

        return contexto


class LectorExcel(ComponenteRPA):
    """
    Componente encargado de escanear la carpeta de entrada data/input/ en busca de
    archivos Excel (.xlsx, .xls), leerlos con Pandas y normalizar sus columnas.

    Attributes:
        ruta_input (Path): Ruta al directorio de archivos de entrada.
    """

    def __init__(
        self,
        nombre: str = "LectorExcel",
        ruta_input: Union[str, Path] = "data/input"
    ) -> None:
        """
        Inicializa la instancia del LectorExcel.

        Args:
            nombre (str): Nombre descriptivo del componente. Por defecto "LectorExcel".
            ruta_input (Union[str, Path]): Ruta a la carpeta de entrada de datos.
        """
        super().__init__(nombre)
        self.ruta_input: Path = Path(ruta_input)

    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Escanea la carpeta de entrada, lee los archivos Excel (.xlsx, .xls), normaliza
        los nombres de sus columnas eliminando espacios en blanco sobrantes y los almacena
        en contexto['archivos_cargados'].

        Args:
            contexto (Dict[str, Any]): Diccionario de contexto global del pipeline.

        Returns:
            Dict[str, Any]: Diccionario de contexto actualizado con 'archivos_cargados'.
        """
        gestor_logs: Optional[GestorLogs] = contexto.get("logger")

        if gestor_logs:
            gestor_logs.registrar(
                f"Escaneando carpeta de entrada RF-001: {self.ruta_input}",
                nivel="INFO"
            )

        if "archivos_cargados" not in contexto:
            contexto["archivos_cargados"] = {}

        if not self.ruta_input.exists() or not self.ruta_input.is_dir():
            if gestor_logs:
                gestor_logs.registrar(
                    f"La carpeta de entrada no existe o no es un directorio: {self.ruta_input}",
                    nivel="WARNING"
                )
            return contexto

        # Escanear archivos .xlsx y .xls
        archivos_excel = [
            f for f in self.ruta_input.iterdir()
            if f.is_file() and f.suffix.lower() in [".xlsx", ".xls"]
        ]

        if not archivos_excel:
            if gestor_logs:
                gestor_logs.registrar(
                    f"No se encontraron archivos de Excel (.xlsx, .xls) en {self.ruta_input}.",
                    nivel="WARNING"
                )
            return contexto

        for archivo in archivos_excel:
            nombre_clave = archivo.stem
            if gestor_logs:
                gestor_logs.registrar(
                    f"Leyendo archivo Excel RF-001: {archivo.name}",
                    nivel="INFO"
                )

            try:
                df = pd.read_excel(archivo)

                # Normalización de nombres de columnas (strip espacios al inicio/final)
                df.columns = [str(col).strip() if isinstance(col, str) else col for col in df.columns]

                contexto["archivos_cargados"][nombre_clave] = df

                if gestor_logs:
                    gestor_logs.registrar(
                        f"Archivo '{archivo.name}' cargado con éxito. Registros: {len(df)}, Columnas: {list(df.columns)}",
                        nivel="DEBUG"
                    )
            except Exception as e:
                if gestor_logs:
                    gestor_logs.registrar(
                        f"Error al leer el archivo Excel '{archivo.name}': {e}",
                        nivel="ERROR"
                    )

        return contexto
