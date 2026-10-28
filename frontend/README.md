# 🌐 Plataforma Fullstack & Motor RPA — LAD-6819

Implementación unificada en **Next.js 16 (App Router)** + **TypeScript estricto** (100% libre de Python):
- **Motor RPA Integrado en TypeScript**: Lectura de buzón IMAP (`imapflow` + `mailparser`), procesamiento Excel (`xlsx`), compresión (`adm-zip`), notificaciones (`nodemailer`) y sincronización con Firebase Firestore / Storage.
- **Arquitectura por Capas**: Rutas (`app/api/`) → Servicios (`lib/.../*.service.ts`) → Repositorios (`lib/.../*.repository.ts`).
- **Persistencia Relacional**: **Prisma 7 + SQLite** con migraciones versionadas (`prisma/migrations/`) y adaptador nativo `better-sqlite3`.
- **Validación**: **Zod 4** en `lib/http/validar.ts` con manejo unificado de códigos 400 y 422.
- **Middleware & CORS**: `proxy.ts` (estándar de Next.js 16).
- **Manejo de Errores**: `AppError` con formato JSON unificado `{ error: { codigo, mensaje, detalles } }` y wrapper `api()`.
- **Documentación OpenAPI 3.1 & Swagger UI**: Disponible en `/api/openapi.json` y `/api/docs`.
- **Pruebas Automatizadas**: Suite completa en **Vitest** (`npm test`).

---

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev

# Ejecutar el Motor RPA (Modo Buzón IMAP)
npm run rpa

# Ejecutar el Motor RPA en modo manual (archivo local)
npx tsx scripts/ejecutar-rpa.ts --cliente cdf --archivo ruta/al/archivo.xlsx

# Ejecutar pruebas automatizadas (unitarias + RPA)
npm test

# Servidor de desarrollo
npm run dev

# Compilación de producción
npm run build
```

---

## 📌 Endpoints Principales

### Motor RPA
- `GET /api/rpa` — Estado de salud del motor RPA y clientes soportados.
- `POST /api/rpa` — Dispara la ejecución del escaneo de buzón y procesamiento en demanda.
- `GET /api/rpa/cron` — Endpoint para Vercel Cron Jobs (ejecución periódica cada 15 min).

### Gestión de Empresas (CRUD REST API)
- `GET /api/empresas` — Lista todas las empresas.
- `POST /api/empresas` — Crea una empresa validada con Zod (201 + Location).
- `GET /api/empresas/:id` — Obtiene una empresa por su ID.
- `PUT /api/empresas/:id` — Actualiza una empresa completa.
- `PATCH /api/empresas/:id` — Actualización parcial.
- `DELETE /api/empresas/:id` — Elimina una empresa (204 No Content).
- `GET /api/openapi.json` — Especificación técnica OpenAPI 3.1.
- `GET /api/docs` — Visor interactivo Swagger UI.
