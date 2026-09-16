"""Servicios Firebase unificados para el RPA y la API Web."""

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore, storage
from registro_log import get_logger

logger = get_logger()

_db = None
_bucket = None


def inicializar_firebase():
    """Inicializa la conexion a Firebase Firestore y Storage."""
    global _db, _bucket
    if _db is not None and _bucket is not None:
        return

    try:
        if not firebase_admin._apps:
            service_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")
            key_path = service_account if service_account else "firebase-key.json"

            if key_path and os.path.exists(key_path):
                cred = credentials.Certificate(key_path)
            elif service_account:
                cred = credentials.Certificate(service_account)
            else:
                cred = credentials.ApplicationDefault()

            bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
            init_opts = {"storageBucket": bucket_name} if bucket_name else {}
            firebase_admin.initialize_app(cred, init_opts)

        _db = firestore.client()
        try:
            _bucket = storage.bucket()
        except Exception as bucket_err:
            logger.warning(f"No se pudo conectar al bucket de Storage: {bucket_err}")

        logger.debug("Conexion a Firebase establecida exitosamente.")
    except Exception as e:
        logger.error(f"Error al conectar con Firebase: {e}")


def guardar_log_nube(correo_id: str, cliente: str, estado: str, error: str = ""):
    """Registra la ejecucion del bot de buzones en la coleccion 'ejecuciones_rpa' de Firestore."""
    global _db
    if _db is None:
        inicializar_firebase()
    if _db:
        try:
            doc_ref = _db.collection("ejecuciones_rpa").document(correo_id)
            doc_ref.set({
                "cliente": cliente,
                "estado": estado,
                "error": error,
                "fecha": firestore.SERVER_TIMESTAMP
            })
        except Exception as e:
            logger.error(f"Error guardando log en la nube: {e}")


class FirebaseService:
    """Gestiona trabajos web y archivos en Firebase Firestore y Storage."""

    def __init__(self) -> None:
        self.db = None
        self.bucket = None

    def _connect(self) -> None:
        global _db, _bucket
        if _db is None or _bucket is None:
            inicializar_firebase()
        self.db = _db
        self.bucket = _bucket

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        self._connect()
        if not self.db:
            return None
        snapshot = self.db.collection("jobs").document(job_id).get()
        if not snapshot.exists:
            return None
        return {"id": snapshot.id, **snapshot.to_dict()}

    def update_job(self, job_id: str, values: dict[str, Any]) -> None:
        self._connect()
        if not self.db:
            return
        values["actualizadoEn"] = datetime.now(timezone.utc)
        self.db.collection("jobs").document(job_id).update(values)

    def download_input(self, job_id: str, path: str, destination: Path) -> None:
        self._connect()
        if not self.bucket:
            raise RuntimeError("El bucket de Firebase Storage no está configurado.")
        blob = self.bucket.blob(path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        blob.download_to_filename(str(destination))

    def upload_output(self, job_id: str, file_path: str, user_id: str | None = None) -> str:
        self._connect()
        if not self.bucket:
            raise RuntimeError("El bucket de Firebase Storage no está configurado.")
        filename = Path(file_path).name
        if user_id:
            storage_path = f"jobs/{user_id}/{job_id}/salida/{filename}"
        else:
            storage_path = f"jobs/{job_id}/salida/{filename}"
        blob = self.bucket.blob(storage_path)
        blob.upload_from_filename(file_path)
        return storage_path


firebase_service = FirebaseService()
