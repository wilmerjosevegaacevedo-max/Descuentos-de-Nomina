import { api } from "@/lib/http/api";
import { leerJson } from "@/lib/http/validar";
import { EmpresaPrismaRepository } from "@/lib/empresas/empresa.prisma.repository";
import { EmpresaService } from "@/lib/empresas/empresa.service";
import { empresaADto } from "@/lib/empresas/empresa.mapper";
import { CrearEmpresaSchema } from "@/lib/empresas/empresa.schema";

const servicio = new EmpresaService(new EmpresaPrismaRepository());

export const GET = api(async () => {
  const empresas = await servicio.listar();
  return Response.json({ datos: empresas.map(empresaADto) });
});

export const POST = api(async (request: Request) => {
  const datos = await leerJson(request, CrearEmpresaSchema);
  const empresa = await servicio.crear(datos);
  return Response.json(empresaADto(empresa), {
    status: 201,
    headers: { Location: `/api/empresas/${empresa.id}` },
  });
});
