// Errores de la aplicación según la guía
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(recurso: string, id: string) {
    super(404, "no_encontrado", `${recurso} con id ${id} no existe`);
  }
}

export class ValidationError extends AppError {
  constructor(details: { campo: string; mensaje: string }[]) {
    super(422, "validacion_fallida", "Los datos enviados no son válidos", details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, "solicitud_invalida", message);
  }
}
