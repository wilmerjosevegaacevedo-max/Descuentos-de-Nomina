"""Carga la configuracion del backend desde variables de entorno y .env."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


@dataclass(frozen=True)
class Environment:
    ftp_host: str = os.getenv("FTP_HOST", "")
    ftp_user: str = os.getenv("FTP_USER", "")
    ftp_password: str = os.getenv("FTP_PASSWORD", "")
    ftp_port: int = int(os.getenv("FTP_PORT", "21"))
    ftp_remote_path: str = os.getenv("FTP_REMOTE_PATH", "")
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_use_tls: bool = os.getenv("SMTP_USE_TLS", "true").strip().lower() in {
        "1", "true", "yes", "on"
    }
    mailbox_host: str = os.getenv("MAILBOX_HOST", "imap.gmail.com")
    mailbox_user: str = os.getenv("MAILBOX_USER", "")
    mailbox_password: str = os.getenv("MAILBOX_PASSWORD", "")
    mailbox_folder: str = os.getenv("MAILBOX_FOLDER", "INBOX")
    mailbox_processed_folder: str = os.getenv("MAILBOX_PROCESSED_FOLDER", "Procesados")
    mailbox_error_folder: str = os.getenv("MAILBOX_ERROR_FOLDER", "Errores")
    admin_email: str = os.getenv("ADMIN_EMAIL", "")
    files_base_path: str = os.getenv("FILES_BASE_PATH", "./files")
    schedule_interval_minutes: int = int(os.getenv("SCHEDULE_INTERVAL_MINUTES", "15"))
    frontend_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS",
            "https://fronted-rpea-46dvuo59b-wilmerjosevegaacevedo-max.vercel.app,"
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    )


env = Environment()