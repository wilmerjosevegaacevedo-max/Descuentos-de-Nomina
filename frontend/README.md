# RPA LAD-6819 · Orquestador de Nómina

App React + Vite + TypeScript conectada a Firebase (Auth, Firestore, Storage) y a un backend FastAPI para el procesamiento de lotes de nómina.

## Qué se actualizó

- **Pantalla de login rediseñada** (`src/components/LoginScreen.tsx`): panel de marca/telemetría a la izquierda, formulario de autenticación a la derecha, selector de cliente (CDF / Continental / DXC), toggle de mostrar/ocultar contraseña y estado de "verificando credenciales" real (conectado a `signInWithEmailAndPassword`, no simulado). El cliente elegido aquí queda preseleccionado en el panel de carga.
- **Centro de Control rediseñado** (`src/components/Dashboard.tsx` y sus subcomponentes), con datos reales en cada sección:
  - `KpiSummary.tsx`: lotes registrados, tasa de efectividad, clientes configurados y último lote, todo calculado a partir de los `jobs` reales de Firestore (nada de cifras de ejemplo fijas).
  - `UploadPanel.tsx`: selector de cliente, zona de arrastrar-y-soltar o clic para elegir archivo, y despacho real del lote (Firestore + Storage + llamada al backend FastAPI), con estado de carga y error reales.
  - `JobsTable.tsx`: tabla en vivo (Firestore `onSnapshot`) con búsqueda, filtro por estado y por cliente, y botón de reintento real para lotes fallidos.
  - `JobDrawer.tsx`: panel de detalle del lote seleccionado, con su estado, tamaño, error (si lo hay) y el enlace real de descarga del ZIP desde Firebase Storage.
  - `DashboardHeader.tsx`: usa el nombre/correo real del usuario autenticado y cierra sesión de verdad; la navegación a otras secciones (Lotes & Auditoría, Reglas de Clientes, Configuración) queda deshabilitada como "Próximamente" porque esas vistas aún no existen.
  - `SystemStatusBar.tsx`: franja de estado de infraestructura marcada explícitamente como *placeholder* — está pensada para conectarse a un endpoint de métricas real del backend más adelante.
- Todo el proyecto (login + panel) usa Tailwind vía CDN (declarado en `index.html`); ya no se usa CSS propio (`src/styles.css` se eliminó).

## Requisitos

- Node.js 18+
- Un proyecto de Firebase con Auth (correo/contraseña), Firestore y Storage habilitados.
- El backend FastAPI corriendo (o accesible) en `VITE_API_URL`.

## Configuración

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env` y completa las credenciales de tu proyecto de Firebase y la URL del backend:
   ```bash
   cp .env.example .env
   ```
3. Arranca el entorno de desarrollo:
   ```bash
   npm run dev
   ```
4. Para generar el build de producción:
   ```bash
   npm run build
   npm run preview
   ```

## Estructura

```
src/
  App.tsx                     Orquestador: auth, Firestore/Storage, despacho y reintento de lotes
  types.ts                    Tipos compartidos (Job, ClienteId, clasificación de estados)
  firebase.ts                 Inicialización de Firebase (Auth, Firestore, Storage)
  main.tsx                    Punto de entrada de React
  vite-env.d.ts                Tipado de variables de entorno de Vite
  utils/format.ts             Formato de bytes, fechas y tiempo relativo
  components/
    LoginScreen.tsx           Pantalla de login
    Dashboard.tsx             Composición del Centro de Control
    DashboardHeader.tsx       Encabezado con usuario real y cierre de sesión
    KpiSummary.tsx            Tarjetas KPI calculadas de los jobs reales
    UploadPanel.tsx           Carga de archivo (drag & drop) y despacho del lote
    JobsTable.tsx             Tabla en vivo de lotes con filtros/búsqueda
    JobDrawer.tsx             Detalle y descarga del lote seleccionado
    SystemStatusBar.tsx       Franja de estado de infraestructura (placeholder)
index.html                    Shell HTML + Tailwind CDN + fuentes/íconos
```

## Notas de seguridad

- Las reglas de Firestore/Storage deben restringir el acceso a `jobs` por `usuarioId` (la consulta ya filtra `where("usuarioId", "==", user.uid)`, pero eso no reemplaza las reglas del lado del servidor).
- El token de Firebase (`user.getIdToken()`) se envía al backend como `Bearer` token; el backend debe verificarlo contra Firebase Admin antes de procesar el job.
