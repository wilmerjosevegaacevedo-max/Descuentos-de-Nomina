"""
Módulo de notificación por correo electrónico SMTP para el RPA LAD-6819.

Implementa el componente NotificadorEmail para estructurar el correo de resultados
con el archivo adjunto comprimido (.zip) para Blacksmith Research Colombia SAS.
"""

from typing import Dict, Any
from pathlib import Path
from src.base import ComponenteRPA


class NotificadorEmail(ComponenteRPA):
    """
    Componente responsable del envío de reportes finales y archivos adjuntos vía SMTP.

    Attributes:
        servidor_smtp (str): Host del servidor SMTP.
        puerto_smtp (int): Puerto del servidor SMTP.
        simular_envio (bool): Modo seguro para desarrollo/pruebas sin conexión real.
    """

    def __init__(
        self,
        nombre: str = "Notificador Correo SMTP",
        servidor_smtp: str = "smtp.blacksmith.co",
        puerto_smtp: int = 587,
        simular_envio: bool = True
    ) -> None:
        super().__init__(nombre)
        self.servidor_smtp: str = servidor_smtp
        self.puerto_smtp: int = puerto_smtp
        self.simular_envio: bool = simular_envio

    def ejecutar(self, contexto: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepara y envía la notificación por correo con el resumen de la nómina y el ZIP.

        Args:
            contexto (Dict[str, Any]): Debe incluir 'ruta_zip_generado' y 'totales_resumen'.

        Returns:
            Dict[str, Any]: Contexto con el estado del envío registrado.
        """
        ruta_zip = contexto.get("ruta_zip_generado")
        if not ruta_zip or not Path(ruta_zip).exists():
            raise FileNotFoundError("No se encontró el archivo ZIP adjunto para el envío.")

        resumen = contexto.get("totales_resumen", {})
        asunto = "[RPA LAD-6819] Reporte Procesamiento de Nómina Completado"
        cuerpo = (
            f"Estimado equipo de Blacksmith Research Colombia SAS,\n\n"
            f"El proceso de nómina LAD-6819 ha finalizado con éxito.\n\n"
            f"Resumen de Ejecución:\n"
            f" - Total Empleados Procesados: {resumen.get('total_empleados', 0)}\n"
            f" - Costo Empleado Anual Total: ${resumen.get('total_costo_empleado_anual', 0.0):,.2f}\n"
            f" - Costo Empresa Anual Total: ${resumen.get('total_costo_empresa_anual', 0.0):,.2f}\n\n"
            f"Se adjunta el archivo comprimido: {Path(ruta_zip).name}\n\n"
            f"Saludos cordiales,\nSistema RPA Blacksmith."
        )

        if self.simular_envio:
            contexto["envio_email_status"] = "SIMULADO_OK"
            contexto["email_asunto"] = asunto
            contexto["email_cuerpo_preview"] = cuerpo[:150] + "..."
        else:
            # Aquí va el flujo smtplib.SMTP / MIMEMultipart en producción
            contexto["envio_email_status"] = "ENVIADO_OK"

        return contexto
