import firebase_admin
from firebase_admin import credentials, firestore
from registro_log import get_logger

logger = get_logger()

_db = None

def inicializar_firebase():
    global _db
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("firebase-key.json")
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
        logger.debug("Conexion a Firebase Firestore establecida.")
    except Exception as e:
        logger.error(f"Error al conectar con Firebase: {e}")

def guardar_log_nube(correo_id: str, cliente: str, estado: str, error: str = ""):
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
