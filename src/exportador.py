"""
Módulo de exportación de layouts y empaquetado para el RPA LAD-6819.

Implementa el componente ExportadorLayouts para generar archivos de salida
en formatos TXT/CSV/Excel y comprimirlos en un archivo ZIP listo para su envío.
"""

import csv
import zipfile
from typing import Dict, Any, List
from pathlib import Path
from src.base import ComponenteRPA


class ExportadorLayouts(ComponenteRPA):
    """
    Componente encargado de estructurar y exportar los resultados calculados
    en layouts físicos y empaquetarlos en un archivo ZIP.

    Attributes:
        directorio_salida (Path): Ruta donde se guardan los layouts exportados.
    """

    def __init__(
        self,
        nombre: str = "Exportador de Layouts y ZIP",
        ruta_salida: str = "data/output"
    ) -> None:
        super().__init__(nombre)
        self.directorio_salida: Path = Path(ruta_salida)
        self.directorio_salida.mkdir(parents=True, exist_ok=True)

    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Genera el archivo CSV/TXT con el resumen de la nómina y lo comprime en ZIP.

        Args:
            contexto (Dict[str, Any]): Contiene 'datos_nomina_procesada'.

        Returns:
            Dict[str, Any]: Contexto actualizado con la ruta del archivo ZIP generado.
        """
        registros: List[Dict[str, Any]] = contexto.get("datos_nomina_procesada", [])
        if not registros:
            raise ValueError("No se encontraron registros procesados para exportar.")

        # 1. Exportación de Layout CSV / TXT
        ruta_layout_txt = self.directorio_salida / "layout_nomina_calculada.txt"
        campos = list(registros[0].keys())

        with open(ruta_layout_txt, mode="w", encoding="utf-8", newline="") as file_txt:
            writer = csv.DictWriter(file_txt, fieldnames=campos, delimiter="|")
            writer.writeheader()
            writer.writerows(registros)

        # 2. Empaquetado en ZIP
        ruta_zip = self.directorio_salida / "resultado_nomina_lad_6819.zip"
        with zipfile.ZipFile(ruta_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            zf.write(ruta_layout_txt, arcname=ruta_layout_txt.name)

        contexto["ruta_layout_generado"] = str(ruta_layout_txt)
        contexto["ruta_zip_generado"] = str(ruta_zip)

        return contexto
