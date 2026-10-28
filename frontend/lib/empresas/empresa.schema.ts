import { z } from "zod";

export const CrearEmpresaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  nit: z
    .string()
    .regex(/^\d{9}-\d$/, "NIT inválido, formato esperado: 123456789-0"),
  email: z.string().email("Email inválido"),
  activa: z.boolean().optional().default(true),
});

export const ActualizarEmpresaSchema = CrearEmpresaSchema.partial();

export const IdParamSchema = z.object({
  id: z.string().min(1, "El id es requerido"),
});

export type CrearEmpresaDto = z.infer<typeof CrearEmpresaSchema>;
export type ActualizarEmpresaDto = z.infer<typeof ActualizarEmpresaSchema>;
