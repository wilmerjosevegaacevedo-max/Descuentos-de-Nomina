import type { RPAClientConfig } from "./types";

export const CLIENTES_CONFIG: Record<string, RPAClientConfig> = {
  cdf: {
    activo: true,
    deteccion: {
      palabras_clave_asunto: ["nomina cdf", "reporte cdf", "pago cdf"],
      dominios_remitente: ["cdf.com", "recursos-cdf.net", "admin.com"],
      patron_archivo: "*.xlsx",
    },
    validacion: {
      columnas_obligatorias: ["CEDULA", "NOMBRE", "ESTADO", "SALARIO"],
      ignorar_filas_vacias: true,
    },
  },
  continental: {
    activo: true,
    deteccion: {
      palabras_clave_asunto: ["nomina continental", "continental hrr", "cont"],
      dominios_remitente: ["continental-corp.com", "hr-conti.net"],
      patron_archivo: "Conti_*.xlsx",
    },
    validacion: {
      columnas_obligatorias: ["ID", "NOMBRE", "DEPARTAMENTO", "SALARIO"],
      ignorar_filas_vacias: true,
    },
  },
  dxc: {
    activo: true,
    deteccion: {
      palabras_clave_asunto: ["reporte dxc", "nomina dxc", "dxc global", "nomina hpe", "reporte hpe"],
      dominios_remitente: ["dxc.com", "dxc-payroll.com", "hpe.com"],
      patron_archivo: "DXC_*.xlsx",
    },
    validacion: {
      columnas_obligatorias: ["ID", "NOMBRE", "PAGO_NETO", "IMPUESTOS", "SEGURO"],
      ignorar_filas_vacias: true,
    },
  },
};

export function normalizarTexto(texto: string): string {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos y tildes
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " "); // espacios simples
}

export function identificarCliente(
  asunto: string,
  remitente: string,
  config: Record<string, RPAClientConfig> = CLIENTES_CONFIG
): string | null {
  const asuntoNorm = normalizarTexto(asunto);
  const remitenteNorm = normalizarTexto(remitente);

  for (const [nombreCli, reglas] of Object.entries(config)) {
    if (!reglas.activo) continue;

    const { palabras_clave_asunto = [], dominios_remitente = [] } = reglas.deteccion;

    // Regla 1: Dominio del remitente
    for (const dominio of dominios_remitente) {
      if (remitenteNorm.includes(normalizarTexto(dominio))) {
        return nombreCli;
      }
    }

    // Regla 2: Palabras clave en el asunto
    for (const palabra of palabras_clave_asunto) {
      if (asuntoNorm.includes(normalizarTexto(palabra))) {
        return nombreCli;
      }
    }
  }

  return null;
}

