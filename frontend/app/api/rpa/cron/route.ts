import { NextResponse } from "next/server";
import { RPAOrchestrator } from "@/lib/rpa/orchestrator";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const orchestrator = new RPAOrchestrator();
    const summary = await orchestrator.ejecutarModoBuzon(25);

    return NextResponse.json({
      ok: true,
      mensaje: "Ejecución periódica RPA completada",
      summary,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("[API /api/rpa/cron] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error durante ejecución de cron RPA",
      },
      { status: 500 }
    );
  }
}

