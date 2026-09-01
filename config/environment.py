"""
config/environment.py
Clase que carga y valida las variables de entorno del archivo .env.
"""
import os
from dotenv import load_dotenv

class Environment:
    """
    Carga y valida todas las variables de configuración del entorno.
    """
    def __init__(self):
        # Cargar archivo .env
        load_dotenv(override=True)
        
        # --- GENERAL ---
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.files_base_path = os.getenv("FILES_BASE_PATH", "./files")
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.admin_email = os.getenv("ADMIN_EMAIL", "")
        
        # --- FTP ---
        self.ftp_host = os.getenv("FTP_HOST")
        self.ftp_user = os.getenv("FTP_USER")
        self.ftp_password = os.getenv("FTP_PASSWORD")
        self.ftp_port = int(os.getenv("FTP_PORT", "21"))
        self.ftp_remote_path = os.getenv("FTP_REMOTE_PATH", "/")
        
        # --- SMTP (Salida) ---
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        
        # --- MAILBOX (Entrada) ---
        self.mailbox_host = os.getenv("MAILBOX_HOST")
        self.mailbox_user = os.getenv("MAILBOX_USER")
        self.mailbox_password = os.getenv("MAILBOX_PASSWORD")
        self.mailbox_folder = os.getenv("MAILBOX_FOLDER", "INBOX")
        self.mailbox_processed_folder = os.getenv("MAILBOX_PROCESSED_FOLDER", "Procesados")
        self.mailbox_error_folder = os.getenv("MAILBOX_ERROR_FOLDER", "Errores")
        
        # --- AWS S3 ---
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_bucket_name = os.getenv("AWS_BUCKET_NAME")
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")

    def validate(self) -> bool:
        """
        Verifica que las variables críticas existan.
        Retorna True si todo es válido, lanza ValueError si falta algo crítico.
        """
        requeridos = {
            "SMTP_HOST": self.smtp_host,
            "SMTP_USER": self.smtp_user,
            "MAILBOX_HOST": self.mailbox_host,
            "MAILBOX_USER": self.mailbox_user,
        }
        
        faltantes = [k for k, v in requeridos.items() if not v]
        if faltantes:
            raise ValueError(f"Faltan variables de entorno críticas en el archivo .env: {', '.join(faltantes)}")
        
        return True

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
        
    @property
    def is_s3_enabled(self) -> bool:
        return bool(self.aws_access_key_id and self.aws_bucket_name)

# Instancia global para ser importada por otros módulos
env = Environment()
