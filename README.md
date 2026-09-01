# 🤖 Orquestador RPA LAD-6819

Sistema automatizado (RPA) escalable para el procesamiento, validación y transformación de archivos de nómina multi-cliente.  
Desarrollado para **Blacksmith Research Colombia SAS**.

---

## 🏗️ Arquitectura del Sistema

El sistema fue diseñado pensando en el escalamiento masivo y sigue un estricto patrón de diseño **Template Method**.
El flujo end-to-end consta de 6 grandes pasos orquestados:

1. **Mailbox Service (`services/mailbox`)**: Se conecta vía Microsoft Exchange (Office365), busca correos no leídos y descarga los Excels adjuntos a una carpeta temporal.
2. **Identificador (`utils.py` + `layout_config.yaml`)**: Lee el archivo YAML de reglas para inferir de qué cliente es el correo (analizando el dominio del remitente y palabras clave en el asunto).
3. **Template Method (`base_client.py`)**: Crea carpetas únicas por lote (Batch ID), ejecuta la lógica del cliente y luego empaqueta los resultados en un `.zip`.
4. **Lógica de Cliente (`clients/`)**: Cada cliente hereda la estructura del `BaseClient` y *solamente* se preocupa de transformar sus propios datos en la función `procesar()`.
5. **Notificación (`services/email`)**: Responde al remitente usando una plantilla HTML profesional y le adjunta el archivo `.zip` final. (Opcionalmente, se sube por FTP usando `ConexionFtp.py`).
6. **Bitácora Anti-Duplicados (`records_data.py`)**: Guarda el ID único del correo en `data/records.json`. Si el script se cae y se reinicia, garantiza que **jamás se vuelva a procesar** un correo que ya dice "EXITOSO".

---

## 📁 Estructura de Directorios

```text
RPA_LAD_6819/
├── clients/                 # Lógica de negocio específica por cliente (ej. CDF, DXC)
├── config/                  # Módulo de lectura segura de variables de entorno (.env)
├── services/                # Servicios de conexión externos
│   ├── email/               # Servicio SMTP y plantillas HTML de reportes
│   └── mailbox/             # Conexión Exchange/Office365 inteligente
├── data/                    # (Auto-generada) Guarda la bitácora JSON anti-duplicados
├── logs/                    # (Auto-generada) Historial de ejecución del bot (.log)
├── files/                   # (Auto-generada) Carpetas temporales de procesamiento
├── .env                     # Credenciales privadas (Ignorado en git)
├── layout_config.yaml       # Reglas de negocio y detección humana (sin tocar código)
├── base_client.py           # Clase abstracta padre para todos los clientes
├── ConexionFtp.py           # Gestor de transferencias FTP con auto-reconexión
├── records_data.py          # Clase ProcessTracker para seguimiento de correos
├── utils.py                 # Funciones utilitarias compartidas y limpieza de disco
├── main.py                  # El Cerebro / Orquestador Principal
├── ejecutar_rpa.bat         # Script de ejecución para Windows Task Scheduler
└── Dockerfile               # Receta de contenedorizado por si se despliega en la Nube
```

---

## 🚀 Guía de Instalación (Windows)

1. **Clonar o descomprimir** el proyecto en tu máquina local.
2. **Crear el Entorno Virtual**:
   Abre una terminal de PowerShell o CMD en la raíz del proyecto y ejecuta:
   ```cmd
   python -m venv venv
   ```
3. **Activar el Entorno**:
   ```cmd
   venv\Scripts\activate
   ```
4. **Instalar Dependencias**:
   ```cmd
   pip install -r requirements.txt
   ```
5. **Configurar Credenciales**: 
   Copia el archivo `.env.example` y renómbralo a `.env`. Rellena con tus contraseñas reales (las cuentas de Office365, el FTP, etc.).

---

## ⚙️ Uso y Ejecución

Tienes dos formas de correr el orquestador:

### 1. Modo Automático (Buzón End-to-End)
El bot entrará a la bandeja de entrada, buscará mensajes no leídos y hará todo el proceso.
```cmd
python main.py
```
> 💡 **Tip:** Puedes usar el archivo `ejecutar_rpa.bat` en el "Programador de Tareas" de Windows para que este modo se ejecute automáticamente todos los días a las 8:00 AM.

### 2. Modo Manual (Desarrollo / Forzado)
Ignora el correo y procesa directamente un archivo local. Ideal para probar lógica nueva sin gastar correos.
```cmd
python main.py --cliente continental --archivo "C:\Users\wilme\Desktop\nomina_conti.xlsx"
```

---

## ➕ ¿Cómo agregar un nuevo cliente en 5 minutos?

La arquitectura está diseñada para que el orquestador crezca sin dolor. Si llega un nuevo cliente llamado "Samsung", sigue estos 3 pasos:

1. **Añade las Reglas**: 
   Abre `layout_config.yaml` y agrega el nuevo cliente:
   ```yaml
   samsung:
     activo: true
     deteccion:
       palabras_clave_asunto: ["nomina samsung"]
       dominios_remitente: ["samsung.com"]
   ```

2. **Crea su Código**: 
   Crea el archivo `clients/samsung.py`. Haz que herede de `BaseClient` e implementa su método `procesar()`:
   ```python
   from base_client import BaseClient

   class ClienteSamsung(BaseClient):
       def __init__(self):
           super().__init__(nombre_cliente="samsung")
           
       def procesar(self, archivo_entrada: str) -> bool:
           df = self.leer_excel(archivo_entrada)
           # ¡Toda tu lógica de pandas aquí!
           self.guardar_excel(df, f"Samsung_Final_{self.batch_id}.xlsx")
           return True
   ```

3. **Inyéctalo al Sistema**: 
   Abre `clients/__init__.py` y agrégalo al diccionario global `CLIENT_MAP`:
   ```python
   from .samsung import ClienteSamsung
   CLIENT_MAP = {
       "samsung": ClienteSamsung
   }
   ```
   ¡Y listo! El bot ahora reconocerá automáticamente correos de Samsung y procesará sus archivos.
