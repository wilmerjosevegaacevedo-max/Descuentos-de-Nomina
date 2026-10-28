import { NotFoundError } from "../http/errors";
import type { EmpresaRepository } from "./empresa.repository";
import type { Empresa, CrearEmpresaInput, ActualizarEmpresaInput } from "./empresa.types";

export class EmpresaService {
  constructor(private readonly repo: EmpresaRepository) {}

  async listar(): Promise<Empresa[]> {
    return this.repo.listar();
  }

  async obtenerPorId(id: string): Promise<Empresa> {
    const empresa = await this.repo.buscarPorId(id);
    if (!empresa) {
      throw new NotFoundError("Empresa", id);
    }
    return empresa;
  }

  async crear(data: CrearEmpresaInput): Promise<Empresa> {
    return this.repo.crear(data);
  }

  async actualizar(id: string, data: ActualizarEmpresaInput): Promise<Empresa> {
    await this.obtenerPorId(id);
    return this.repo.actualizar(id, data);
  }

  async eliminar(id: string): Promise<void> {
    await this.obtenerPorId(id);
    return this.repo.eliminar(id);
  }
}
