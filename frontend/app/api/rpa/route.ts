import { NextResponse } from "next/server";
import { RPAOrchestrator } from "@/lib/rpa/orchestrator";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    motor: "TypeScript / Next.js 16 (App Router)",
    plataforma: "RPA LAD-6819 Descuentos de Nómina",
    clientesSoportados: ["cdf", "continental", "dxc"],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const orchestrator = new RPAOrchestrator();

    // Comprobar si envían un archivo puntual o si es ejecución general de buzón
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      const maxCorreos = Number(body?.maxCorreos) || 20;

      const summary = await orchestrator.ejecutarModoBuzon(maxCorreos);
      return NextResponse.json({
        ok: true,
        summary,
      });
    }

    // Por defecto, ejecuta el escaneo de Gmail IMAP
    const summary = await orchestrator.ejecutarModoBuzon();
    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (error) {
    console.error("[API /api/rpa] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error interno al ejecutar RPA",
      },
      { status: 500 }
    );
  }
}

