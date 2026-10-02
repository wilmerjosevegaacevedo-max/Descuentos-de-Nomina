"""
services/mailbox/service.py
Servicio para conectarse a buzones IMAP (Diseñado para Gmail).
Busca correos nuevos, descarga los adjuntos y organiza los mensajes en etiquetas/carpetas.
"""

import os
import imaplib
import email
from email.header import decode_header
from pathlib import Path
from typing import List

from config.environment import env
from registro_log import get_logger

logger = get_logger()

class CorreoIMAPItem:
    """Clase adaptadora para mantener compatibilidad exacta con el main.py original"""
    def __init__(self, msg_id, subject, sender_email, attachments, raw_msg):
        self.id = msg_id
        self.message_id = msg_id
        self.subject = subject
        
        # Simular objeto sender de exchangelib
        class SenderObj:
            def __init__(self, email_address):
                self.email_address = email_address
        self.sender = SenderObj(sender_email)
        
        self.attachments = attachments
        self.raw_msg = raw_msg

class AttachmentIMAP:
    """Clase adaptadora de adjuntos"""
    def __init__(self, name, content):
        self.name = name
        self.content = content

class MailboxService:
    """Servicio de conexión IMAP compatible con Gmail."""

    def __init__(self):
        self.user = env.mailbox_user
        self.password = env.mailbox_password
        self.server = env.mailbox_host or "imap.gmail.com"
        self.folder_inbox = env.mailbox_folder or "INBOX"
        self.folder_processed = env.mailbox_processed_folder or "Procesados"
        self.folder_error = env.mailbox_error_folder or "Errores"
        self.imap = None

    def conectar(self) -> bool:
        """Establece la conexión IMAP con Gmail."""
        if not self.user or not self.password or self.password == "reemplaza_esto_por_la_contraseña_de_aplicacion":
            logger.error("Contraseña de aplicación de Gmail no configurada en el .env.")
            return False
            
        logger.info(f"Conectando al buzón IMAP (Gmail): {self.user}...")
        try:
            self.imap = imaplib.IMAP4_SSL(self.server)
            self.imap.login(self.user, self.password)
            logger.success("✅ Conexión a Gmail (IMAP) establecida correctamente.")
            self._asegurar_carpetas()
            return True
        except imaplib.IMAP4.error as e:
            logger.error(f"❌ Autenticación fallida de Gmail. ¿Generaste una Contraseña de Aplicación? Detalle: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Error al conectar por IMAP: {e}")
            return False

    def _asegurar_carpetas(self):
        """Crea las etiquetas 'Procesados' y 'Errores' en Gmail si no existen."""
        if not self.imap: return
        for folder in [self.folder_processed, self.folder_error]:
            try:
                self.imap.create(folder)
            except:
                pass # Ya existe

    def _decode_str(self, s) -> str:
        """Decodifica strings de correos como '=?utf-8?q?asunto?='."""
        if not s: return ""
        decoded_list = decode_header(s)
        res = ""
        for byte_str, charset in decoded_list:
            if isinstance(byte_str, bytes):
                res += byte_str.decode(charset or 'utf-8', errors='ignore')
            else:
                res += str(byte_str)
        return res

    def _extraer_email_puro(self, remitente_raw: str) -> str:
        """Extrae 'user@correo.com' de 'Juan Perez <user@correo.com>'"""
        if "<" in remitente_raw and ">" in remitente_raw:
            return remitente_raw.split("<")[1].split(">")[0]
        return remitente_raw

    def obtener_correos_pendientes(self, max_correos: int = 50) -> list:
        """Busca correos NO leídos (UNSEEN)."""
        if not self.imap and not self.conectar():
            return []
            
        try:
            self.imap.select(self.folder_inbox)
            status, mensajes = self.imap.search(None, 'UNSEEN')
            
            if status != 'OK' or not mensajes[0]:
                logger.info("El buzón de Gmail está al día.")
                return []
                
            ids_correos = mensajes[0].split()
            correos_pendientes = []
            
            logger.info(f"Escaneando {len(ids_correos)} correos nuevos...")
            
            for msg_id in reversed(ids_correos[-max_correos:]):
                res, msg_data = self.imap.fetch(msg_id, '(RFC822)')
                if res != 'OK': continue
                
                # Extraer cuerpo crudo
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                asunto = self._decode_str(msg.get("Subject"))
                remitente_crudo = self._decode_str(msg.get("From"))
                remitente_limpio = self._extraer_email_puro(remitente_crudo)
                
                # Extraer adjuntos
                adjuntos = []
                tiene_excel = False
                
                for part in msg.walk():
                    if part.get_content_maintype() == 'multipart': continue
                    if part.get('Content-Disposition') is None: continue
                    
                    filename = part.get_filename()
                    if filename:
                        filename = self._decode_str(filename)
                        if filename.lower().endswith(('.xlsx', '.xls', '.csv')):
                            tiene_excel = True
                            adjuntos.append(AttachmentIMAP(filename, part.get_payload(decode=True)))
                            
                if tiene_excel:
                    correo_obj = CorreoIMAPItem(msg_id.decode(), asunto, remitente_limpio, adjuntos, msg)
                    correos_pendientes.append(correo_obj)
            
            return correos_pendientes
            
        except Exception as e:
            logger.error(f"Error escaneando correos IMAP: {e}")
            return []

    def descargar_adjuntos(self, correo_item, ruta_destino: str) -> List[str]:
        """Guarda los adjuntos extraídos en el disco duro."""
        archivos_descargados = []
        carpeta_local = Path(ruta_destino)
        carpeta_local.mkdir(parents=True, exist_ok=True)
        
        for att in correo_item.attachments:
            ruta_archivo = carpeta_local / att.name
            try:
                with open(ruta_archivo, 'wb') as f:
                    f.write(att.content)
                archivos_descargados.append(str(ruta_archivo))
                logger.debug(f"Adjunto de Gmail descargado: {att.name}")
            except Exception as e:
                logger.error(f"Error al guardar archivo {att.name}: {e}")
                
        return archivos_descargados

    def marcar_como_leido(self, correo_item):
        """Quita la negrita al correo en Gmail (lo marca como leído)."""
        try:
            self.imap.select(self.folder_inbox)
            self.imap.store(correo_item.id, '+FLAGS', '\\Seen')
        except Exception as e:
            logger.error(f"Error al marcar como leído en Gmail: {e}")

    def mover_correo(self, correo_item, exito: bool):
        """Mueve el correo a las etiquetas 'Procesados' o 'Errores'."""
        carpeta_destino = self.folder_processed if exito else self.folder_error
        try:
            self.imap.select(self.folder_inbox)
            # 1. Copiar a la nueva etiqueta
            res, _ = self.imap.copy(correo_item.id, carpeta_destino)
            if res == 'OK':
                # 2. Borrar de la carpeta original (INBOX)
                self.imap.store(correo_item.id, '+FLAGS', '\\Deleted')
                self.imap.expunge()
                logger.info(f"Correo de Gmail movido exitosamente a -> {carpeta_destino}")
            else:
                logger.error(f"Gmail falló al intentar mover el correo a {carpeta_destino}")
        except Exception as e:
            logger.error(f"Error al mover correo en Gmail: {e}")
