// Dominio interno: camelCase
export interface Empresa {
  id: string;
  nombre: string;
  nit: string;
  email: string;
  activa: boolean;
  creadaEn: Date;
}

export type CrearEmpresaInput = Omit<Empresa, "id" | "creadaEn">;
export type ActualizarEmpresaInput = Partial<CrearEmpresaInput>;
