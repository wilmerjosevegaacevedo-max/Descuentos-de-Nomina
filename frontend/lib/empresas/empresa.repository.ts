import type { Empresa, CrearEmpresaInput, ActualizarEmpresaInput } from "./empresa.types";

export interface EmpresaRepository {
  listar(): Promise<Empresa[]>;
  buscarPorId(id: string): Promise<Empresa | null>;
  crear(data: CrearEmpresaInput): Promise<Empresa>;
  actualizar(id: string, data: ActualizarEmpresaInput): Promise<Empresa>;
  eliminar(id: string): Promise<void>;
}
