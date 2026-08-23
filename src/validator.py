"""
Módulo de validación y limpieza de datos para el sistema RPA LAD-6819.

Proporciona la clase ValidadorNomina para verificar la estructura y aplicar rutinas
de limpieza (normalización de texto, estandarización de números y fechas, deduplicación)
sobre cada DataFrame cargado en el contexto.
"""

from typing import Dict, Any, List, Optional
import pandas as pd

from src.base import ComponenteRPA
from src.logger import GestorLogs


class ValidadorNomina(ComponenteRPA):
    """
    Componente encargado de la validación estructural (RF-002) y la limpieza/estandarización
    de datos (RF-003) en los DataFrames cargados en el pipeline.
    """

    def __init__(self, nombre: str = "ValidadorNomina") -> None:
        """
        Inicializa la instancia del ValidadorNomina.

        Args:
            nombre (str): Nombre descriptivo del componente. Por defecto "ValidadorNomina".
        """
        super().__init__(nombre)

    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Itera sobre los DataFrames en contexto['archivos_cargados'], aplica las reglas
        de validación estructural y limpieza de datos según la configuración del aliado,
        y almacena los DataFrames procesados en contexto['datos_validados'].

        Args:
            contexto (Dict[str, Any]): Diccionario de contexto global. Debe contener
                'archivos_cargados' y opcionalmente 'configuraciones' y 'logger'.

        Returns:
            Dict[str, Any]: Diccionario de contexto actualizado con 'datos_validados'.
        """
        gestor_logs: Optional[GestorLogs] = contexto.get("logger")
        archivos_cargados: Dict[str, pd.DataFrame] = contexto.get("archivos_cargados", {})
        configuraciones: Dict[str, Any] = contexto.get("configuraciones", {})

        if gestor_logs:
            gestor_logs.registrar(
                "Iniciando fase de validación y limpieza de datos (RF-002, RF-003)...",
                nivel="INFO"
            )

        if "datos_validados" not in contexto:
            contexto["datos_validados"] = {}

        if not archivos_cargados:
            if gestor_logs:
                gestor_logs.registrar(
                    "No hay archivos cargados en el contexto para validar.",
                    nivel="WARNING"
                )
            return contexto

        for nombre_aliado, df_original in archivos_cargados.items():
            if gestor_logs:
                gestor_logs.registrar(
                    f"Procesando validaciones para aliado/archivo: '{nombre_aliado}'",
                    nivel="INFO"
                )

            try:
                df = df_original.copy()
                config_aliado = configuraciones.get(nombre_aliado, {})
                if not config_aliado and "default" in configuraciones:
                    config_aliado = configuraciones["default"]

                # 1. Validación Estructural (RF-002)
                columnas_obligatorias: List[str] = config_aliado.get("columnas_obligatorias", [])
                if columnas_obligatorias:
                    columnas_faltantes = [
                        col for col in columnas_obligatorias if col not in df.columns
                    ]
                    if columnas_faltantes:
                        mensaje_err = (
                            f"RF-002 ERROR CRÍTICO: Al archivo '{nombre_aliado}' le faltan "
                            f"las siguientes columnas obligatorias: {columnas_faltantes}. "
                            "Se omite este archivo del flujo."
                        )
                        if gestor_logs:
                            gestor_logs.registrar(mensaje_err, nivel="ERROR")
                        continue

                # 2. Normalización de Texto (RF-003)
                # Remueve espacios en blanco al inicio y final en columnas de texto
                columnas_string = df.select_dtypes(include=["object", "string"]).columns
                for col in columnas_string:
                    df[col] = df[col].apply(lambda v: v.strip() if isinstance(v, str) else v)

                # 3. Estandarización de Números y Fechas (RF-003)
                # Convertir comas a puntos decimales en columnas numéricas/texto con formato decimal
                cols_numericas: List[str] = config_aliado.get("columnas_numericas", [])
                for col in cols_numericas:
                    if col in df.columns:
                        if df[col].dtype == object or isinstance(df[col].dtype, pd.StringDtype):
                            df[col] = df[col].astype(str).str.replace(",", ".", regex=False)
                        df[col] = pd.to_numeric(df[col], errors="coerce")

                # Reemplazo general de comas por puntos en strings con números si no se especifica lista explícita
                if not cols_numericas:
                    for col in df.columns:
                        if df[col].dtype == object:
                            # Si es una columna tipo string con formato "123,45"
                            sample = df[col].dropna().astype(str)
                            if sample.str.contains(r"^\d+,\d+$").any():
                                df[col] = df[col].astype(str).str.replace(",", ".", regex=False)

                # Casteo de fechas al formato estándar (YYYY-MM-DD)
                cols_fechas: List[str] = config_aliado.get("columnas_fechas", [])
                for col in cols_fechas:
                    if col in df.columns:
                        fechas_parsed = pd.to_datetime(df[col], errors="coerce")
                        df[col] = fechas_parsed.dt.strftime("%Y-%m-%d")

                # Si no se definen columnas_fechas explícitas, detectar por nombre o tipo
                if not cols_fechas:
                    for col in df.columns:
                        if "fecha" in col.lower() or "date" in col.lower():
                            fechas_parsed = pd.to_datetime(df[col], errors="coerce")
                            df[col] = fechas_parsed.dt.strftime("%Y-%m-%d")

                # 4. Eliminación de Duplicados (RF-003)
                col_documento = "Cedula"
                if col_documento not in df.columns:
                    # Buscar variaciones comunes si "Cedula" no existe exacto
                    for c in df.columns:
                        if c.lower() in ["cedula", "cédula", "documento", "id_empleado"]:
                            col_documento = c
                            break

                if col_documento in df.columns:
                    registros_iniciales = len(df)
                    df = df.drop_duplicates(subset=[col_documento], keep="first")
                    duplicados_removidos = registros_iniciales - len(df)
                    if gestor_logs:
                        gestor_logs.registrar(
                            f"RF-003 Duplicados: Se eliminaron {duplicados_removidos} registros duplicados "
                            f"basados en la columna '{col_documento}' para '{nombre_aliado}'.",
                            nivel="INFO"
                        )
                else:
                    if gestor_logs:
                        gestor_logs.registrar(
                            f"No se encontró la columna '{col_documento}' para deduplicar en '{nombre_aliado}'.",
                            nivel="WARNING"
                        )

                # Guardar DataFrame validado y limpio
                contexto["datos_validados"][nombre_aliado] = df

                if gestor_logs:
                    gestor_logs.registrar(
                        f"Validación y limpieza completada para '{nombre_aliado}'. Registros válidos final: {len(df)}.",
                        nivel="INFO"
                    )

            except Exception as e:
                mensaje_exc = f"Excepción al validar/limpiar el archivo '{nombre_aliado}': {str(e)}"
                if gestor_logs:
                    gestor_logs.registrar(mensaje_exc, nivel="ERROR")

        return contexto
