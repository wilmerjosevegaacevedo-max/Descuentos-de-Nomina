import { AppError } from "./errors";

function respuestaDeError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          codigo: error.code,
          mensaje: error.message,
          detalles: error.details,
        },
      },
      { status: error.status }
    );
  }

  console.error("[error]", error);
  return Response.json(
    { error: { codigo: "error_interno", mensaje: "Error interno del servidor" } },
    { status: 500 }
  );
}

export function api<Args extends [Request, ...unknown[]]>(
  handler: (...args: Args) => Promise<Response> | Response
) {
  return async (...args: Args): Promise<Response> => {
    const [request] = args;
    const inicio = performance.now();
    let respuesta: Response;
    try {
      respuesta = await handler(...args);
    } catch (error) {
      respuesta = respuestaDeError(error);
    }
    const ms = Math.round(performance.now() - inicio);
    const { pathname } = new URL(request.url);
    console.log(`[api] ${request.method} ${pathname} ${respuesta.status} ${ms}ms`);
    return respuesta;
  };
}
