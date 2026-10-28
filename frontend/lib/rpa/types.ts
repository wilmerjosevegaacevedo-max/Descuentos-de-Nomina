export interface RPAClientConfig {
  activo: boolean;
  deteccion: {
    palabras_clave_asunto: string[];
    dominios_remitente: string[];
    patron_archivo?: string;
  };
  validacion?: {
    columnas_obligatorias?: string[];
    ignorar_filas_vacias?: boolean;
  };
}

export interface AttachmentItem {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface EmailMessageItem {
  id: string;
  messageId: string;
  subject: string;
  sender: string;
  senderAddress: string;
  date?: Date;
  attachments: AttachmentItem[];
}

export interface ProcessResult {
  cliente: string;
  batchId: string;
  exito: boolean;
  archivoZip?: string;
  zipBuffer?: Buffer;
  error?: string;
  detalles?: string;
}

export interface RPARunSummary {
  ejecutadoEn: string;
  totalCorreos: number;
  procesados: number;
  exitosos: number;
  fallidos: number;
  ignorados: number;
  resultados: Array<{
    correoId: string;
    asunto: string;
    remitente: string;
    cliente: string;
    estado: "EXITOSO" | "FALLIDO" | "IGNORADO";
    mensaje: string;
    batchId?: string;
  }>;
}

