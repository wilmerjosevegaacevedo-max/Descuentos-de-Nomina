# Manual de ejecucion del RPA con frontend React

Este manual explica como ejecutar el proyecto completo en Windows:

- Backend: Python + FastAPI.
- Frontend: React + Vite.
- Autenticacion, estados y archivos: Firebase.
- Motor de negocio: el RPA existente en Python.

## 1. Requisitos

Instala o verifica:

```powershell
python --version
node --version
npm.cmd --version
```

Se recomienda:

- Python 3.11 o superior.
- Node.js LTS.
- Una cuenta de Firebase.
- Acceso a las credenciales de Office365, SMTP y Firebase.

En este equipo Node esta instalado en:

```text
C:\Users\SANTANA\AppData\Local\Programs\nodejs
```

Si PowerShell muestra un error relacionado con `npm.ps1`, usa `npm.cmd` en todos los comandos.

## 2. Abrir la carpeta correcta

Abre PowerShell en la carpeta que contiene `main.py`:

```powershell
cd "C:\Users\SANTANA\Documents\LAYAUTDDENOMINA\Descuentos-de-Nomina"
```

Comprueba la ubicacion:

```powershell
Get-ChildItem main.py, requirements.txt, frontend\package.json
```

## 3. Configurar Python

Crea y activa un entorno virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si PowerShell bloquea la activacion, ejecuta Python directamente desde el entorno:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Instala las dependencias:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## 4. Configurar variables del backend

Copia la plantilla:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y completa como minimo:

```env
SMTP_HOST=smtp.office365.com
SMTP_USER=correo-del-bot
SMTP_PASSWORD=contrasena-smtp
MAILBOX_HOST=outlook.office365.com
MAILBOX_USER=correo-del-bot
MAILBOX_PASSWORD=contrasena-del-buzon
ADMIN_EMAIL=correo-administrador

FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
```

No publiques `.env` ni `firebase-service-account.json` en Git.

## 5. Configurar Firebase

En Firebase Console:

1. Crea o selecciona un proyecto.
2. Habilita Authentication.
3. Activa el proveedor `Email/Password`.
4. Crea un usuario de prueba.
5. Crea Firestore en modo produccion.
6. Crea Firebase Storage.
7. En Project settings, registra una aplicacion Web.
8. En Project settings > Service accounts, genera una clave privada.
9. Guarda el JSON descargado en la raiz del proyecto como `firebase-service-account.json`.
10. Copia la configuracion web en `frontend/.env`.

Ejemplo de `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:8000
```

Publica las reglas incluidas en el proyecto con Firebase CLI:

```powershell
npm.cmd install -g firebase-tools
firebase login
firebase use tu-proyecto
firebase deploy --only firestore:rules,storage
```

Si todavia no existe la configuracion local de Firebase CLI, ejecuta `firebase init` y selecciona Firestore y Storage para este proyecto.

## 6. Instalar y ejecutar el backend

Abre una primera terminal en la raiz del proyecto:

```powershell
cd "C:\Users\SANTANA\Documents\LAYAUTDDENOMINA\Descuentos-de-Nomina"
.\.venv\Scripts\Activate.ps1
uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

La API quedara disponible en:

```text
http://localhost:8000
```

Comprueba el estado desde otra terminal:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

La documentacion interactiva esta en:

```text
http://localhost:8000/docs
```

No cierres esta terminal mientras uses el frontend.

## 7. Instalar y ejecutar el frontend

Abre una segunda terminal:

```powershell
cd "C:\Users\SANTANA\Documents\LAYAUTDDENOMINA\Descuentos-de-Nomina\frontend"
npm.cmd install
npm.cmd run dev
```

Vite mostrara una URL parecida a:

```text
http://localhost:5173/
```

Abre esa direccion en el navegador.

## 8. Ejecutar un procesamiento desde el frontend

1. Abre el frontend.
2. Inicia sesion con el usuario creado en Firebase Authentication.
3. Selecciona `CDF`, `Continental` o `DXC`.
4. Selecciona un archivo `.xls` o `.xlsx`.
5. Pulsa `Procesar lote`.
6. Espera a que el estado cambie de `PENDIENTE` a `PROCESANDO`.
7. Cuando termine, el estado sera `EXITOSO` o `FALLIDO`.
8. Si fue exitoso, pulsa `Descargar ZIP`.

El frontend guarda el trabajo en la coleccion `jobs` de Firestore y sube el Excel a:

```text
jobs/{usuarioId}/{jobId}/entrada/{archivo}
```

El backend guarda el resultado en:

```text
jobs/{usuarioId}/{jobId}/salida/{archivo}.zip
```

## 9. Ejecutar el modo original del RPA

El modo buzón sigue funcionando sin el frontend:

```powershell
cd "C:\Users\SANTANA\Documents\LAYAUTDDENOMINA\Descuentos-de-Nomina"
.\.venv\Scripts\Activate.ps1
python main.py
```

Para procesar manualmente un archivo:

```powershell
python main.py --cliente continental --archivo "C:\ruta\nomina.xlsx"
```

## 10. Compilar el frontend para produccion

Desde `frontend`:

```powershell
npm.cmd run build
```

El resultado queda en:

```text
frontend/dist/
```

Para probar ese resultado localmente:

```powershell
npm.cmd run preview
```

## 11. Problemas frecuentes

### `npm.ps1 no se puede cargar`

Usa:

```powershell
npm.cmd install
npm.cmd run dev
```

### `Token Firebase invalido`

Comprueba que:

- El usuario exista en Firebase Authentication.
- El frontend use el `projectId` correcto.
- La API use la cuenta de servicio del mismo proyecto.
- `FIREBASE_SERVICE_ACCOUNT` apunte al JSON correcto.

### `Trabajo no encontrado`

Comprueba que el documento exista en Firestore y tenga el mismo `usuarioId` del usuario autenticado.

### El frontend no conecta con la API

Comprueba `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Reinicia Vite despues de modificar cualquier variable `VITE_`.

### No aparece el ZIP

Revisa la terminal donde corre FastAPI. Tambien verifica que:

- El procesamiento del cliente haya terminado correctamente.
- Firebase Storage este habilitado.
- La cuenta de servicio tenga permisos.
- El archivo de entrada sea compatible con el cliente seleccionado.

### Firestore solicita un indice

La consulta del historial usa `usuarioId` y `creadoEn`. Firebase mostrara un enlace para crear el indice compuesto; abre el enlace y acepta la creacion.

## 12. Orden diario de arranque

Terminal 1, backend:

```powershell
cd "C:\Users\SANTANA\Documents\LAYAUTDDENOMINA\Descuentos-de-Nomina"
.\.venv\Scripts\Activate.ps1
uvicorn api:app --reload --port 8000
```

Terminal 2, frontend:

```powershell
cd "C:\Users\SANTANA\Documents\LAYAUTDDENOMINA\Descuentos-de-Nomina\frontend"
npm.cmd run dev
```

Luego abre `http://localhost:5173/`.
