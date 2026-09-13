import type { Timestamp } from "firebase/firestore";

export type ClienteId = "cdf" | "continental" | "dxc";

export const CLIENTES: { id: ClienteId; label: string }[] = [
  { id: "cdf", label: "CDF" },
  { id: "continental", label: "Continental" },
  { id: "dxc", label: "DXC Tech" },
];

export type EstadoJob = "PENDIENTE" | "PROCESANDO" | "EXITOSO" | "COMPLETADO" | "FALLIDO" | string;

export type Job = {
  id: string;
  cliente: string;
  nombreArchivo: string;
  estado: EstadoJob;
  archivoEntrada?: string;
  archivoSalida?: string;
  usuarioId?: string;
  error?: string;
  tamanoBytes?: number;
  creadoEn?: Timestamp;
};

const ESTADOS_EXITO = new Set(["EXITOSO", "COMPLETADO"]);
const ESTADOS_FALLO = new Set(["FALLIDO", "ERROR"]);
const ESTADOS_PROCESO = new Set(["PENDIENTE", "PROCESANDO"]);

export function grupoEstado(estado: EstadoJob): "exito" | "fallo" | "proceso" | "otro" {
  const normalizado = estado.toUpperCase();
  if (ESTADOS_EXITO.has(normalizado)) return "exito";
  if (ESTADOS_FALLO.has(normalizado)) return "fallo";
  if (ESTADOS_PROCESO.has(normalizado)) return "proceso";
  return "otro";
}
