import { BaseClient } from "./base.client";
import { ClienteCDF } from "./cdf.client";
import { ClienteContinental } from "./continental.client";
import { ClienteDXC } from "./dxc.client";

export { BaseClient, ClienteCDF, ClienteContinental, ClienteDXC };

export const CLIENT_MAP: Record<string, new () => BaseClient> = {
  cdf: ClienteCDF,
  continental: ClienteContinental,
  dxc: ClienteDXC,
};

export function obtenerCliente(nombre: string): BaseClient | null {
  const ClienteClase = CLIENT_MAP[nombre.toLowerCase()];
  if (!ClienteClase) return null;
  return new ClienteClase();
}

