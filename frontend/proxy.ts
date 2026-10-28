import { NextResponse, type NextRequest } from "next/server";

const permitidos = (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

function cabecerasCors(origin: string | null) {
  const headers = new Headers();
  if (origin && permitidos.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  return headers;
}

export function proxy(request: NextRequest) {
  const cors = cabecerasCors(request.headers.get("origin"));

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: cors });
  }

  const response = NextResponse.next();
  cors.forEach((valor, nombre) => response.headers.set(nombre, valor));
  return response;
}

export const config = { matcher: "/api/:path*" };
