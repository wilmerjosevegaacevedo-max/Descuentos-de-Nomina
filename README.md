# 🤖 Orquestador RPA LAD-6819
**Descuentos de Nómina — Motor Automatizado**  
Desarrollado para **Blacksmith Research Colombia SAS**

[![Estado](https://img.shields.io/badge/Estado-Producción%20🟢-brightgreen)]()
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20🔥-orange)]()
[![Python](https://img.shields.io/badge/Python-3.10+-blue)]()
[![React](https://img.shields.io/badge/Dashboard-React%20+%20TypeScript-61DAFB)]()

---

## 🧠 ¿Qué hace este sistema?

Robot de automatización (RPA) que **monitorea una bandeja de Gmail cada 15 minutos**, detecta correos con archivos Excel adjuntos, los valida, transforma y procesa según las reglas de cada cliente. Responde automáticamente al remitente con el resultado (éxito o error) y registra todo en **Firebase Firestore** en tiempo real, visible desde un **Dashboard Web**.

---

## 🏗️ Arquitectura del Sistema

```
📧 Correo Gmail (IMAP)
        ↓
⚙️  Orquestador (main.py)
        ↓
🔍  Identificador de Cliente (layout_config.yaml)
        ↓
📊  Procesamiento & Validación (clients/)
        ↓
📤  Notificación por Correo (SMTP)
        ↓
☁️  Firebase Firestore — Log en la nube
        ↓
🌐  Dashboard Web (localhost:5173)
```

El flujo completo consta de 6 pasos orquestados con patrón **Template Method**:

1. **Mailbox Service (`services/mailbox`)**: Se conecta vía Gmail IMAP, busca correos no leídos y descarga los Excels adjuntos.
2. **Identificador (`utils.py` + `layout_config.yaml`)**: Infiere de qué cliente es el correo por palabras clave en el asunto.
3. **Template Method (`base_client.py`)**: Crea carpetas únicas por lote (Batch ID), ejecuta la lógica del cliente y empaqueta resultados en `.zip`.
4. **Lógica de Cliente (`clients/`)**: Cada cliente hereda `BaseClient` e implementa su propia función `procesar()`.
5. **Notificación (`services/email`)**: Responde al remitente con plantilla HTML profesional adjuntando el `.zip`. Si hay error, adjunta la plantilla correcta del cliente.
6. **Bitácora & Nube (`records_data.py` + `services/firebase_service.py`)**: Guarda el ID del correo en `data/records.json` (anti-duplicados) y sube el log a **Firebase Firestore** en tiempo real.

---

## 📁 Estructura de Directorios

```text
rpa_lad_6819/
├── clients/                 # Lógica de negocio por cliente (CDF, DXC, etc.)
├── config/                  # Lectura segura de variables de entorno (.env)
├── services/
│   ├── email/               # Servicio SMTP y plantillas HTML
│   ├── mailbox/             # Conexión Gmail IMAP
│   └── firebase_service.py  # Conector a Firebase Firestore
├── frontend/                # Dashboard Web (React + TypeScript + Vite)
│   └── src/
│       ├── App.tsx          # Pantalla principal
│       ├── firebase.ts      # Conexión Firebase web
│       └── components/      # Componentes: Dashboard, Login, KPIs, etc.
├── data/                    # (Auto) Bitácora JSON anti-duplicados
├── logs/                    # (Auto) Historial de ejecución (.log)
├── files/
│   └── templates/           # Plantillas Excel por cliente (para emails de error)
├── .env                     # Credenciales privadas (ignorado en git)
├── firebase-key.json        # Llave Firebase Admin SDK (ignorado en git)
├── layout_config.yaml       # Reglas de detección de clientes
├── base_client.py           # Clase abstracta padre
├── ConexionFtp.py           # Gestor FTP con auto-reconexión
├── records_data.py          # ProcessTracker: bitácora + Firebase
├── utils.py                 # Utilidades y limpieza automática de disco (7 días)
├── main.py                  # Orquestador Principal
├── api.py                   # API REST (FastAPI)
├── ejecutar_rpa.bat         # Lanzador para Windows Task Scheduler
└── Dockerfile               # Contenedorizado para despliegue en la nube
```

---

## 🚀 Guía de Instalación (Windows)

### Backend (Bot RPA)

1. **Clonar el repositorio**:
   ```powershell
   git clone https://github.com/wilmerjosevegaacevedo-max/Descuentos-de-Nomina.git
   cd Descuentos-de-Nomina
   ```

2. **Crear entorno virtual**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Instalar dependencias**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configurar credenciales**:
   Copia `.env.example` → `.env` y rellena:
   ```env
   GMAIL_USER=rpalad6819@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

5. **Configurar Firebase**:
   Descarga la llave privada de Firebase Console (Configuración → Cuentas de servicio → Generar nueva clave privada) y guárdala como `firebase-key.json` en la raíz del proyecto.

### Frontend (Dashboard Web)

1. **Instalar dependencias**:
   ```powershell
   cd frontend
   npm install
   ```

2. **Configurar Firebase web**:
   Copia `frontend/.env.example` → `frontend/.env` y rellena con las credenciales de tu proyecto Firebase:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_APP_ID=...
   ```

3. **Arrancar el Dashboard**:
   ```powershell
   npm run dev
   ```
   Abre **http://localhost:5173** en tu navegador.

---

## ⚙️ Uso y Ejecución

### Modo Automático (Task Scheduler — cada 15 min)
```powershell
.\ejecutar_rpa.bat
```
> El bot revisa Gmail, procesa correos nuevos y sube logs a Firebase.

### Modo Manual (Desarrollo / Pruebas)
```powershell
.\venv\Scripts\python.exe main.py --cliente cdf --archivo "C:\ruta\nomina.xlsx"
```

### Dashboard Web
```
URL:     http://localhost:5173
Usuario: admin@rpa-nomina.com
Clave:   RPA-Nomina2026*
```

---

## 🔥 Integración Firebase

| Servicio | Uso |
|---|---|
| **Firestore** | Logs de ejecución en tiempo real (`ejecuciones_rpa`) |
| **Authentication** | Login seguro del Dashboard Web |
| **Storage** | Archivos de entrada/salida por job |

---

## ➕ ¿Cómo agregar un nuevo cliente en 5 minutos?

1. **Añade las reglas** en `layout_config.yaml`:
   ```yaml
   samsung:
     activo: true
     deteccion:
       palabras_clave_asunto: ["nomina samsung"]
       dominios_remitente: ["samsung.com"]
   ```

2. **Crea su código** en `clients/samsung.py`:
   ```python
   from base_client import BaseClient

   class ClienteSamsung(BaseClient):
       def __init__(self):
           super().__init__(nombre_cliente="samsung")

       def procesar(self, archivo_entrada: str) -> bool:
           df = self.leer_excel(archivo_entrada)
           # Tu lógica de pandas aquí
           self.guardar_excel(df, f"Samsung_Final_{self.batch_id}.xlsx")
           return True
   ```

3. **Inyéctalo** en `clients/__init__.py`:
   ```python
   from .samsung import ClienteSamsung
   CLIENT_MAP = {
       "cdf": ClienteCDF,
       "samsung": ClienteSamsung   # ← nuevo
   }
   ```

¡Listo! El bot reconocerá correos de Samsung automáticamente. 🚀

---

## 📬 Instrucciones para Colaboradores

Para enviarle un archivo al bot para que lo procese:

| Campo | Valor |
|---|---|
| **Destinatario** | `rpalad6819@gmail.com` |
| **Asunto** | Nombre del cliente (ej: `nomina cdf`) |
| **Adjunto** | Archivo `.xlsx` con los datos |

El bot responde en máximo **15 minutos** con:
- ✅ **Correo verde**: Éxito — adjunta el ZIP procesado.
- ❌ **Correo rojo**: Error — adjunta la plantilla correcta para que corrijas el archivo.

---

## 🛡️ Seguridad

- `firebase-key.json` y `.env` están en `.gitignore` y **nunca** se suben a GitHub.
- La limpieza automática de archivos temporales se ejecuta cada 7 días.
- La carpeta `files/templates/` está protegida de la limpieza automática.

---

*Última actualización: Septiembre 2026 — Blacksmith Research Colombia SAS*
