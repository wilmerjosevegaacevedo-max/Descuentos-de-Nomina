# 🤖 Orquestador RPA LAD-6819
**Descuentos de Nómina — Plataforma Automatizada 100% TypeScript / Next.js**  
Desarrollado para **Blacksmith Research Colombia SAS**

[![Estado](https://img.shields.io/badge/Estado-100%25%20TypeScript%20%2F%20Next.js%20🟢-brightgreen)]()
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20🔥-orange)]()
[![Despliegue](https://img.shields.io/badge/Vercel-Producci%C3%B3n-black)](https://fronted-rpea.vercel.app)
[![Vitest](https://img.shields.io/badge/Tests-14%2F14%20Passing%20✅-green)]()

---

## 🧠 ¿Qué hace este sistema?

Robot de automatización (RPA) y plataforma integral de deducciones de nómina que:
1. **Monitorea la bandeja de Gmail vía IMAP**: Detecta planillas Excel adjuntas enviadas por empresas aliadas (*Continental Gold*, *CDF*, *DXC*).
2. **Valida y transforma datos**: Procesa las deducciones de pólizas (Vida, GMM, Costos) aplicando las reglas de negocio de cada entidad.
3. **Responde automáticamente vía SMTP**: Envía confirmaciones con los archivos procesados o plantillas de corrección.
4. **Registra bitácora en Firebase Firestore**: Sincroniza novedades en tiempo real con el Centro de Control y Dashboard Web.
5. **Emite Comprobantes Oficiales**: Genera recibos oficiales de retención individual imprimibles y exportables en PDF.

---

## 🏗️ Arquitectura del Sistema (100% TypeScript / Node.js)

```
📧 Correo Gmail (IMAP Flow / Mailparser)
        ↓
⚙️  Orquestador RPA (lib/rpa/orchestrator.ts)
        ↓
🔍  Detector de Cliente por Asunto / Formato (lib/rpa/detector.ts)
        ↓
📊  Procesamiento & Clientes (lib/rpa/clients/: Continental, CDF, DXC)
        ↓
📤  Notificación por Correo (lib/rpa/services/email.service.ts)
        ↓
☁️  Firebase Firestore (lib/rpa/services/firebase.service.ts)
        ↓
🌐  Dashboard Web en Vivo (Next.js 14 / Vercel)
```

---

## 📁 Estructura del Proyecto

```text
rpa_lad_6819/
├── frontend/                    # ⚛️ Motor RPA + Plataforma Web (Next.js / TypeScript)
│   ├── app/                     # Rutas App Router y Endpoints API (/api/rpa, /api/nomina)
│   ├── lib/
│   │   └── rpa/                 # 🤖 Motor RPA TypeScript puro
│   │       ├── clients/         # Clientes Continental, CDF, DXC
│   │       ├── services/        # Servicios de Correo (IMAP/SMTP), Firebase y Tracker
│   │       ├── orchestrator.ts  # Orquestador principal de ejecución
│   │       ├── detector.ts      # Detección inteligente de planillas
│   │       └── types.ts         # Tipado estricto del dominio
│   ├── scripts/
│   │   └── ejecutar-rpa.ts      # Script de ejecución por consola
│   ├── tests/
│   │   └── rpa.test.ts          # 14 Pruebas unitarias automatizadas (Vitest)
│   ├── package.json             # Dependencias TypeScript/Node.js
│   └── vitest.config.ts         # Configuración de pruebas
├── docs/                        # 📄 Documentación técnica, diagramas y especificaciones
├── ejecutar_rpa.bat             # 🚀 Lanzador de un solo clic para Windows
├── firestore.rules              # Reglas de seguridad Firestore
└── storage.rules                # Reglas de seguridad Firebase Storage
```

---

## ⚙️ Uso y Ejecución

### 1. Ejecutar el Robot RPA (Un solo clic)
Doble clic en:
```cmd
ejecutar_rpa.bat
```
O desde la terminal:
```bash
cd frontend
npm run rpa
```

### 2. Ejecutar Pruebas Automatizadas
```bash
cd frontend
npm test
```
*Ejecuta 14 pruebas que validan los cálculos de Continental, CDF, DXC, detección de planillas y persistencia.*

### 3. Ejecutar el Servidor Web Local
```bash
cd frontend
npm run dev
```
Acceder en el navegador: `http://localhost:3000`

---

## 🌐 Producción y Despliegue en la Nube
* **URL en Vivo**: [https://fronted-rpea.vercel.app](https://fronted-rpea.vercel.app)
* **Repositorio de Producción**: [github.com/wilmerjosevegaacevedo-max/frontedRPEA](https://github.com/wilmerjosevegaacevedo-max/frontedRPEA)

---

*Última actualización: Octubre 2026 — Blacksmith Research Colombia SAS*
