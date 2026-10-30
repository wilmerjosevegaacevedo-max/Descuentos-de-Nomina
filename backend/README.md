# ⚙️ RPA Backend API REST (TypeScript / Node.js)

Servidor backend desacoplado y motor del robot RPA LAD-6819.

## 🚀 Tecnologías
* **Node.js & TypeScript**
* **Express & CORS**
* **XLSX**: Procesamiento en memoria de planillas Excel.
* **IMAPFlow & Mailparser**: Conexión a la bandeja de entrada de Gmail.
* **Nodemailer**: Respuestas automáticas vía SMTP.
* **Firebase Admin**: Persistencia y sincronización con Firestore.

## 🛠️ Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor en modo desarrollo con recarga en vivo
npm run dev

# Ejecutar el robot RPA por consola
npm run rpa

# Compilar para producción
npm run build

# Iniciar servidor de producción compilado
npm start
```

## 📡 Endpoints Disponibles
* `GET  /api/health`: Estado de salud y uptime del servicio.
* `POST /api/rpa/scan`: Dispara el escaneo del buzón Gmail IMAP y procesa novedades.
* `POST /api/nomina/procesar`: Procesa un lote de empleados calculando deducciones por cliente.
* `POST /api/pagos/individual`: Asienta una deducción individual para un colaborador.
* `GET  /api/empresas`: Consulta empresas y reglas de negocio activas.
