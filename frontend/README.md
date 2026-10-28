# 🌐 API REST & Plataforma — RPA LAD-6819

Implementación construida siguiendo al 100% las especificaciones y reglas arquitectónicas de la **Guía Oficial de Desarrollo Web (Semanas 9 a 12 · Hito 3)**:
- **Next.js 16 (App Router)** + **TypeScript estricto** (sin Python).
- **Arquitectura por Capas**: Rutas (`app/api/`) → Servicios (`lib/.../*.service.ts`) → Repositorios (`lib/.../*.repository.ts`).
- **Persistencia Relacional**: **Prisma 7 + SQLite** con migraciones versionadas (`prisma/migrations/`) y adaptador nativo `better-sqlite3`.
- **Validación**: **Zod 4** en `lib/http/validar.ts` con manejo unificado de códigos 400 y 422.
- **Middleware & CORS**: `proxy.ts` (estándar de Next.js 16).
- **Manejo de Errores**: `AppError` con formato JSON unificado `{ error: { codigo, mensaje, detalles } }` y wrapper `api()`.
- **Documentación OpenAPI 3.1 & Swagger UI**: Disponible en `/api/openapi.json` y `/api/docs`.
- **Pruebas Automatizadas**: Suite completa en **Vitest** (`npm test`).
- **Colección de Solicitudes**: Archivo ejecutable `requests/api.http` con variables encadenadas (`# @name`).

---

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev

# Ejecutar pruebas automatizadas
npm test

# Modo desarrollo
npm run dev

# Compilación de producción
npm run build
```

---

## 📌 Endpoints Principales

- `GET /api/empresas` — Lista todas las empresas.
- `POST /api/empresas` — Crea una empresa validada con Zod (201 + Location).
- `GET /api/empresas/:id` — Obtiene una empresa por su ID.
- `PUT /api/empresas/:id` — Actualiza una empresa completa.
- `PATCH /api/empresas/:id` — Actualización parcial.
- `DELETE /api/empresas/:id` — Elimina una empresa (204 No Content).
- `GET /api/openapi.json` — Especificación técnica OpenAPI 3.1.
- `GET /api/docs` — Visor interactivo Swagger UI.
