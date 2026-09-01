"""
services/mailbox/service.py
Servicio para conectarse a buzones de Office365/Exchange.
Busca correos nuevos, descarga los adjuntos y organiza los mensajes en carpetas.
"""

import os
from pathlib import Path
from typing import List
from exchangelib import Credentials, Account, Configuration, DELEGATE
from exchangelib.errors import ErrorFolderNotFound

from config.environment import env
from registro_log import get_logger

logger = get_logger()

class MailboxService:
    """Servicio de conexión y manejo de buzones Exchange/Office365."""

    def __init__(self):
        self.user = env.mailbox_user
        self.password = env.mailbox_password
        self.server = env.mailbox_host
        self.folder_inbox_name = env.mailbox_folder
        self.folder_processed_name = env.mailbox_processed_folder
        self.folder_error_name = env.mailbox_error_folder
        self.account = None

    def conectar(self) -> bool:
        """Establece la conexión con el servidor Exchange usando credenciales."""
        if not self.user or not self.password:
            logger.error("Credenciales de buzón (MAILBOX) incompletas en el .env.")
            return False

        logger.info(f"Conectando al buzón Exchange: {self.user}...")
        try:
            credentials = Credentials(self.user, self.password)
            if self.server:
                config = Configuration(server=self.server, credentials=credentials)
                self.account = Account(
                    primary_smtp_address=self.user,
                    config=config, autodiscover=False, access_type=DELEGATE
                )
            else:
                self.account = Account(
                    primary_smtp_address=self.user,
                    credentials=credentials, autodiscover=True, access_type=DELEGATE
                )
                
            logger.success("✅ Conexión al buzón Exchange establecida correctamente.")
            self._asegurar_carpetas_destino()
            return True
        except Exception as e:
            logger.error(f"❌ Error al conectar con el buzón: {e}")
            return False

    def _asegurar_carpetas_destino(self):
        """Asegura que las carpetas de destino existan en el buzón."""
        if not self.account: return
            
        for folder_name in [self.folder_processed_name, self.folder_error_name]:
            try:
                folder = self.account.inbox.children.get(name=folder_name)
            except ErrorFolderNotFound:
                logger.info(f"Creando carpeta remota '{folder_name}' en el buzón...")
                from exchangelib import Folder
                new_folder = Folder(parent=self.account.inbox, name=folder_name)
                new_folder.save()

    def obtener_correos_pendientes(self, max_correos: int = 50) -> list:
        """Busca correos NO leídos con adjuntos."""
        if not self.account and not self.conectar():
            return []

        logger.info("Buscando nuevos correos con archivos adjuntos...")
        correos_pendientes = []
        try:
            q = self.account.inbox.filter(is_read=False, has_attachments=True).order_by('-datetime_received')
            for item in q[:max_correos]:
                correos_pendientes.append(item)
            logger.info(f"Se encontraron {len(correos_pendientes)} correos pendientes para procesar.")
            return correos_pendientes
        except Exception as e:
            logger.error(f"Error al buscar correos: {e}")
            return []

    def descargar_adjuntos(self, correo_item, ruta_destino: str) -> List[str]:
        """Descarga los archivos Excel adjuntos de un correo."""
        archivos_descargados = []
        carpeta_local = Path(ruta_destino)
        carpeta_local.mkdir(parents=True, exist_ok=True)

        for attachment in correo_item.attachments:
            nombre = attachment.name.lower()
            if nombre.endswith(('.xlsx', '.xls', '.csv')):
                ruta_archivo = carpeta_local / attachment.name
                try:
                    with open(ruta_archivo, 'wb') as f:
                        f.write(attachment.content)
                    archivos_descargados.append(str(ruta_archivo))
                    logger.debug(f"Adjunto descargado: {attachment.name}")
                except Exception as e:
                    logger.error(f"Error al descargar adjunto {attachment.name}: {e}")
        return archivos_descargados

    def marcar_como_leido(self, correo_item):
        """Marca un correo como leído."""
        try:
            correo_item.is_read = True
            correo_item.save(update_fields=['is_read'])
        except Exception as e:
            logger.error(f"Error al marcar correo como leído: {e}")

    def mover_correo(self, correo_item, exito: bool):
        """Mueve el correo a 'Procesados' o 'Errores'."""
        if not self.account: return
        carpeta_destino_nombre = self.folder_processed_name if exito else self.folder_error_name
        try:
            carpeta_destino = self.account.inbox.children.get(name=carpeta_destino_nombre)
            correo_item.move(carpeta_destino)
            logger.info(f"Correo '{correo_item.subject}' movido a -> {carpeta_destino_nombre}")
        except Exception as e:
            logger.error(f"Error al mover el correo a {carpeta_destino_nombre}: {e}")
