# Manual de ejecucion del proyecto

## Requisitos

- Windows 10/11 y Python 3.10 o superior.
- Acceso a las credenciales que correspondan al modo de ejecucion: buzón IMAP, correo SMTP, FTP y/o Firebase.
- Una copia completa del proyecto, incluidas las carpetas `backend/config` y `backend/clients`.

## Preparar el backend

Abre PowerShell en la carpeta principal del proyecto y ejecuta:

```powershell
Set-Location .\backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edita `backend/.env` y reemplaza los valores de ejemplo por las credenciales reales. Para procesar correos, configura `MAILBOX_HOST`, `MAILBOX_USER` y `MAILBOX_PASSWORD`. Para enviar notificaciones, configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` y `ADMIN_EMAIL`. Si el procesamiento utiliza FTP, completa también `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD` y `FTP_REMOTE_PATH`.

No publiques el archivo `.env` ni las credenciales de Firebase. Para Firebase, configura las credenciales de cuenta de servicio mediante `FIREBASE_SERVICE_ACCOUNT` o coloca el archivo de servicio como `backend/firebase-key.json`. La API requiere además `FIREBASE_STORAGE_BUCKET` para descargar y subir archivos.

## Ejecutar el RPA

### Procesar el buzón

Desde `backend`, ejecuta:

```powershell
.\.venv\Scripts\python.exe main.py
```

El programa se conecta al buzón, busca mensajes pendientes con adjuntos Excel/CSV, intenta identificar al cliente por el asunto y remitente, procesa los archivos y registra el resultado. Para ejecutarlo periódicamente, configura el Programador de tareas de Windows para iniciar este comando con la frecuencia requerida.

### Procesar un archivo local

Indica el cliente y la ruta del archivo de entrada:

```powershell
.\.venv\Scripts\python.exe main.py --cliente cdf --archivo "C:\ruta\nomina.xlsx"
```

El nombre del cliente debe estar registrado en `backend/clients/` y en el mapa `CLIENT_MAP`. Reemplaza `cdf` y la ruta por los valores correspondientes a tu archivo.

### Iniciar la API (opcional)

Desde `backend`, ejecuta:

```powershell
.\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

La comprobación de estado queda disponible en `http://127.0.0.1:8000/health`. Los endpoints de trabajos requieren un token de Firebase válido.

## Registros y solución de problemas

- Revisa la salida de PowerShell y los archivos de log generados por el backend.
- Si no puede conectarse al buzón, verifica host, usuario, contraseña de aplicación y que IMAP esté habilitado.
- Si no puede enviar notificaciones, revisa los datos SMTP y el acceso/autenticación de la cuenta de correo.
- Si no reconoce al cliente, valida las reglas de `backend/layout_config.yaml`, el asunto y el remitente.
- Si falla Firebase, comprueba la cuenta de servicio, los permisos del proyecto y el bucket configurado.
- Si aparece `ModuleNotFoundError` para `config` o `clients`, verifica que esas carpetas y sus archivos formen parte de la copia del proyecto. En la estructura disponible al crear este manual no aparecen `backend/config` ni `backend/clients`; el backend necesita esos módulos para arrancar.

## Nota sobre el lanzador de Windows

`backend/ejecutar_rpa.bat` contiene una ruta absoluta de otra máquina. Si deseas usarlo, actualiza la línea `cd /d` para que apunte a la carpeta `backend` de esta instalación. El comando directo con el entorno virtual de este manual evita depender de esa ruta fija.