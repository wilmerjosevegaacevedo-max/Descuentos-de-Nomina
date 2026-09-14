"""Punto de acceso compatible para servicios Firebase."""

from services.firebase_service import (
    FirebaseService,
    firebase_service,
    guardar_log_nube,
    inicializar_firebase,
)

__all__ = [
    "FirebaseService",
    "firebase_service",
    "guardar_log_nube",
    "inicializar_firebase",
]
