import { api } from "@/lib/http/api";
import { leerJson } from "@/lib/http/validar";
import { EmpresaPrismaRepository } from "@/lib/empresas/empresa.prisma.repository";
import { EmpresaService } from "@/lib/empresas/empresa.service";
import { empresaADto } from "@/lib/empresas/empresa.mapper";
import {
  ActualizarEmpresaSchema,
  CrearEmpresaSchema,
} from "@/lib/empresas/empresa.schema";

const servicio = new EmpresaService(new EmpresaPrismaRepository());

export const GET = api(async (_request: Request, ctx: any) => {
  const { id } = await ctx.params;
  return Response.json(empresaADto(await servicio.obtenerPorId(id)));
});

export const PUT = api(async (request: Request, ctx: any) => {
  const { id } = await ctx.params;
  const datos = await leerJson(request, CrearEmpresaSchema);
  return Response.json(empresaADto(await servicio.actualizar(id, datos)));
});

export const PATCH = api(async (request: Request, ctx: any) => {
  const { id } = await ctx.params;
  const cambios = await leerJson(request, ActualizarEmpresaSchema);
  return Response.json(empresaADto(await servicio.actualizar(id, cambios)));
});

export const DELETE = api(async (_request: Request, ctx: any) => {
  const { id } = await ctx.params;
  await servicio.eliminar(id);
  return new Response(null, { status: 204 });
});
