"""
services/email/service.py
Servicio para enviar correos electrónicos SMTP con plantillas HTML y adjuntos.
"""

import smtplib
import mimetypes
from pathlib import Path
from datetime import datetime
from email.message import EmailMessage

from config.environment import env
from registro_log import get_logger

logger = get_logger()

class EmailService:
    """
    Servicio de notificación por correo.
    Permite enviar reportes procesados usando plantillas HTML.
    """
    
    def __init__(self):
        self.host = env.smtp_host
        self.port = env.smtp_port
        self.user = env.smtp_user
        self.password = env.smtp_password
        self.use_tls = env.smtp_use_tls
        self.admin_email = env.admin_email
        
        # Cargar plantilla HTML
        self.template_path = Path(__file__).parent / "template.html"

    def _cargar_plantilla(self, **kwargs) -> str:
        """Lee el HTML y reemplaza las variables enviadas en los kwargs."""
        try:
            with open(self.template_path, 'r', encoding='utf-8') as file:
                html = file.read()
                
            # Reemplazar variables (ej: {{cliente}} -> "Continental")
            for key, value in kwargs.items():
                html = html.replace(f"{{{{{key}}}}}", str(value))
                
            return html
        except Exception as e:
            logger.error(f"Error al cargar la plantilla de correo: {e}")
            # Fallback simple si no encuentra el HTML
            return f"<h3>Reporte RPA</h3><p>Cliente: {kwargs.get('cliente')}</p><p>Estado: {kwargs.get('estado')}</p>"

    def enviar_reporte(self, destinatarios: list, cliente: str, batch_id: str, 
                       exito: bool, mensaje: str, archivo_adjunto: str = None) -> bool:
        """
        Construye y envía el correo electrónico.
        """
        if not self.host or not self.user or not self.password:
            logger.error("No se puede enviar el correo: credenciales SMTP no configuradas en .env")
            return False

        logger.info(f"Preparando correo de notificación para {cliente}...")
        
        estado_texto = "EXITOSO" if exito else "FALLIDO"
        clase_estado = "status-success" if exito else "status-error"
        asunto = f"[RPA LAD-6819] Resultado de procesamiento - {cliente.upper()} - {estado_texto}"

        # Llenar la plantilla HTML
        html_content = self._cargar_plantilla(
            cliente=cliente.upper(),
            estado=estado_texto,
            clase_estado=clase_estado,
            batch_id=batch_id,
            total_archivos="1 (ZIP consolidado)" if archivo_adjunto else "0",
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            mensaje_detalle=mensaje
        )

        msg = EmailMessage()
        msg['Subject'] = asunto
        msg['From'] = self.user
        
        # Si envían destinatarios usar esos, sino enviar al admin configurado
        to_addresses = destinatarios if destinatarios else [self.admin_email]
        # Filtrar vacíos
        to_addresses = [email for email in to_addresses if email]
        
        if not to_addresses:
            logger.warning("No hay destinatarios configurados para este correo.")
            return False
            
        msg['To'] = ", ".join(to_addresses)
        msg.set_content("Por favor activa la vista HTML en tu cliente de correo para ver este mensaje.")
        msg.add_alternative(html_content, subtype='html')

        # Procesar adjunto (si existe)
        if archivo_adjunto:
            path_adjunto = Path(archivo_adjunto)
            if path_adjunto.exists():
                ctype, encoding = mimetypes.guess_type(str(path_adjunto))
                if ctype is None or encoding is not None:
                    ctype = 'application/octet-stream'
                maintype, subtype = ctype.split('/', 1)
                
                with open(path_adjunto, 'rb') as f:
                    msg.add_attachment(f.read(),
                                       maintype=maintype,
                                       subtype=subtype,
                                       filename=path_adjunto.name)
                logger.debug(f"Archivo {path_adjunto.name} adjuntado al correo.")
            else:
                logger.warning(f"Se indicó adjunto pero el archivo no existe: {archivo_adjunto}")

        # Enviar el correo
        try:
            logger.info(f"Conectando al servidor SMTP {self.host}:{self.port}")
            with smtplib.SMTP(self.host, self.port, timeout=30) as server:
                server.ehlo()
                if self.use_tls:
                    server.starttls()
                    server.ehlo()
                server.login(self.user, self.password)
                server.send_message(msg)
                
            logger.success(f"✅ Correo enviado exitosamente a: {to_addresses}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error al enviar el correo SMTP: {e}")
            return False
