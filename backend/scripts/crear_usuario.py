"""
Script para crear usuario administrador en Firebase Authentication
"""
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, auth

BACKEND_DIR = Path(__file__).resolve().parents[1]

# Inicializar Firebase
cred = credentials.Certificate(str(BACKEND_DIR / "firebase-key.json"))
firebase_admin.initialize_app(cred)

# Datos del usuario
EMAIL    = "admin@rpa-nomina.com"
PASSWORD = "RPA-Nomina2026*"
NOMBRE   = "Administrador RPA"

try:
    user = auth.create_user(
        email=EMAIL,
        password=PASSWORD,
        display_name=NOMBRE
    )
    print("=" * 50)
    print("✅ USUARIO CREADO EXITOSAMENTE")
    print("=" * 50)
    print(f"  📧 Correo  : {EMAIL}")
    print(f"  🔑 Clave   : {PASSWORD}")
    print(f"  🆔 UID     : {user.uid}")
    print("=" * 50)
    print("Abre http://localhost:5173 e inicia sesión")
except auth.EmailAlreadyExistsError:
    print("=" * 50)
    print("ℹ️  El usuario ya existe. Credenciales:")
    print("=" * 50)
    print(f"  📧 Correo  : {EMAIL}")
    print(f"  🔑 Clave   : {PASSWORD}")
    print("=" * 50)
except Exception as e:
    print(f"❌ Error: {e}")
