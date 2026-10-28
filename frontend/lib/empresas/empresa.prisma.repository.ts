import { prisma } from "@/lib/prisma";
import type { EmpresaRepository } from "./empresa.repository";
import type { Empresa, CrearEmpresaInput, ActualizarEmpresaInput } from "./empresa.types";
import { registroAEmpresa } from "./empresa.mapper";

export class EmpresaPrismaRepository implements EmpresaRepository {
  async listar(): Promise<Empresa[]> {
    const registros = await prisma.empresa.findMany({
      orderBy: { creadaEn: "desc" },
    });
    return registros.map(registroAEmpresa);
  }

  async buscarPorId(id: string): Promise<Empresa | null> {
    const registro = await prisma.empresa.findUnique({
      where: { id },
    });
    return registro ? registroAEmpresa(registro) : null;
  }

  async crear(data: CrearEmpresaInput): Promise<Empresa> {
    const registro = await prisma.empresa.create({
      data: {
        nombre: data.nombre,
        nit: data.nit,
        email: data.email,
        activa: data.activa,
      },
    });
    return registroAEmpresa(registro);
  }

  async actualizar(id: string, data: ActualizarEmpresaInput): Promise<Empresa> {
    const registro = await prisma.empresa.update({
      where: { id },
      data,
    });
    return registroAEmpresa(registro);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.empresa.delete({ where: { id } });
  }
}
