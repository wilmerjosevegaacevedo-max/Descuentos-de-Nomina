import { NextRequest, NextResponse } from "next/server";
import { generarOpenApi } from "@/lib/openapi";

export function GET(req: NextRequest) {
  const baseUrl = new URL(req.url).origin;
  return NextResponse.json(generarOpenApi(baseUrl), { status: 200 });
}
