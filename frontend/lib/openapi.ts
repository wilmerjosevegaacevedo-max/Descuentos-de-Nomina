import { z } from "zod";
import { CrearEmpresaSchema } from "@/lib/empresas/empresa.schema";

const empresaDto = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    nombre: { type: "string", example: "CDF Colombia SAS" },
    nit: { type: "string", example: "900123456-1" },
    email: { type: "string", format: "email", example: "nomina@cdf.com.co" },
    activa: { type: "boolean", example: true },
    creada_en: { type: "string", format: "date-time" },
  },
  required: ["id", "nombre", "nit", "email", "activa", "creada_en"],
};

const errorDto = {
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        codigo: { type: "string" },
        mensaje: { type: "string" },
        detalles: { type: "array", items: {} },
      },
      required: ["codigo", "mensaje"],
    },
  },
};

export function generarOpenApi(baseUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "RPA LAD-6819 API",
      version: "1.0.0",
      description: "API REST para gestión de empresas y planillas de nómina — Blacksmith Research Colombia SAS",
    },
    servers: [{ url: baseUrl }],
    paths: {
      "/api/empresas": {
        get: {
          summary: "Listar empresas",
          operationId: "listarEmpresas",
          tags: ["Empresas"],
          responses: {
            "200": {
              description: "Lista de empresas",
              content: { "application/json": { schema: { type: "array", items: empresaDto } } },
            },
          },
        },
        post: {
          summary: "Crear empresa",
          operationId: "crearEmpresa",
          tags: ["Empresas"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: z.toJSONSchema(CrearEmpresaSchema),
              },
            },
          },
          responses: {
            "201": {
              description: "Empresa creada",
              content: { "application/json": { schema: empresaDto } },
            },
            "422": { description: "Error de validación", content: { "application/json": { schema: errorDto } } },
          },
        },
      },
      "/api/empresas/{id}": {
        get: {
          summary: "Obtener empresa por ID",
          operationId: "obtenerEmpresa",
          tags: ["Empresas"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Empresa encontrada", content: { "application/json": { schema: empresaDto } } },
            "404": { description: "No encontrada", content: { "application/json": { schema: errorDto } } },
          },
        },
        put: {
          summary: "Actualizar empresa",
          operationId: "actualizarEmpresa",
          tags: ["Empresas"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: z.toJSONSchema(CrearEmpresaSchema.partial()) } },
          },
          responses: {
            "200": { description: "Empresa actualizada", content: { "application/json": { schema: empresaDto } } },
            "404": { description: "No encontrada", content: { "application/json": { schema: errorDto } } },
            "422": { description: "Error de validación", content: { "application/json": { schema: errorDto } } },
          },
        },
        delete: {
          summary: "Eliminar empresa",
          operationId: "eliminarEmpresa",
          tags: ["Empresas"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "204": { description: "Empresa eliminada" },
            "404": { description: "No encontrada", content: { "application/json": { schema: errorDto } } },
          },
        },
      },
    },
  };
}
