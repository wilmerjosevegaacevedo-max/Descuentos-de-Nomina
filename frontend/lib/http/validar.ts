import type { ZodType } from "zod";
import { BadRequestError, ValidationError } from "./errors";

export async function leerJson<T>(
  request: Request,
  schema: ZodType<T>
): Promise<T> {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    throw new BadRequestError("El cuerpo no es un JSON válido");
  }

  const resultado = schema.safeParse(cuerpo);
  if (!resultado.success) {
    throw new ValidationError(
      resultado.error.issues.map((issue) => ({
        campo: issue.path.join(".") || "(cuerpo)",
        mensaje: issue.message,
      }))
    );
  }
  return resultado.data;
}

export function leerQuery<T>(request: Request, schema: ZodType<T>): T {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const resultado = schema.safeParse(params);
  if (!resultado.success) {
    throw new ValidationError(
      resultado.error.issues.map((issue) => ({
        campo: issue.path.join(".") || "(url)",
        mensaje: issue.message,
      }))
    );
  }
  return resultado.data;
}
