import type { Empresa } from "./empresa.types";

export interface EmpresaDto {
  id: string;
  nombre: string;
  nit: string;
  email: string;
  activa: boolean;
  creada_en: string;
}

export function empresaADto(empresa: Empresa): EmpresaDto {
  return {
    id: empresa.id,
    nombre: empresa.nombre,
    nit: empresa.nit,
    email: empresa.email,
    activa: empresa.activa,
    creada_en: empresa.creadaEn.toISOString(),
  };
}

export function registroAEmpresa(registro: {
  id: string;
  nombre: string;
  nit: string;
  email: string;
  activa: boolean;
  creadaEn: Date;
}): Empresa {
  return {
    id: registro.id,
    nombre: registro.nombre,
    nit: registro.nit,
    email: registro.email,
    activa: registro.activa,
    creadaEn: registro.creadaEn,
  };
}
