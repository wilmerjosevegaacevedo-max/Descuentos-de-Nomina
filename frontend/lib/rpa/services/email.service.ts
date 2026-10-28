import fs from "node:fs";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import { getRPAConfig } from "../config";

export interface SendReportOptions {
  destinatarios: string[];
  cliente: string;
  batchId: string;
  exito: boolean;
  mensaje: string;
  archivoAdjuntoPath?: string;
  archivoAdjuntoBuffer?: Buffer;
  archivoAdjuntoNombre?: string;
}

export class EmailService {
  private config = getRPAConfig();
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure, // false para port 587
      auth: {
        user: this.config.smtp.user,
        pass: this.config.smtp.pass,
      },
    });
  }

  private generarHtml(options: {
    cliente: string;
    estadoTexto: string;
    claseEstado: string;
    batchId: string;
    totalArchivos: string;
    fecha: string;
    mensaje: string;
  }): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #0056b3;
            color: white;
            padding: 20px 30px;
            text-align: center;
        }
        .header h2 {
            margin: 0;
            font-weight: 500;
        }
        .content {
            padding: 30px;
        }
        .status-box {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 25px;
            font-weight: bold;
            text-align: center;
        }
        .status-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table th, table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eeeeee;
            text-align: left;
        }
        table th {
            background-color: #f8f9fa;
            color: #555555;
            font-weight: 600;
        }
        .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #777777;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Notificación de Sistema RPA LAD-6819</h2>
        </div>
        <div class="content">
            <p>Hola Equipo,</p>
            <p>El bot de automatización ha procesado una solicitud para el cliente <strong>${options.cliente}</strong>.</p>
            
            <div class="status-box ${options.claseEstado}">
                Estado del Proceso: ${options.estadoTexto}
            </div>

            <table>
                <tr>
                    <th>Lote (Batch ID)</th>
                    <td>${options.batchId}</td>
                </tr>
                <tr>
                    <th>Archivos Procesados</th>
                    <td>${options.totalArchivos}</td>
                </tr>
                <tr>
                    <th>Fecha de Ejecución</th>
                    <td>${options.fecha}</td>
                </tr>
                <tr>
                    <th>Detalles</th>
                    <td>${options.mensaje}</td>
                </tr>
            </table>
        </div>
        <div class="footer">
            Mensaje generado automáticamente por el Motor RPA Next.js · Blacksmith Research Colombia SAS
        </div>
    </div>
</body>
</html>`;
  }

  public async enviarReporte(opts: SendReportOptions): Promise<boolean> {
    const estadoTexto = opts.exito ? "EXITOSO" : "FALLIDO";
    const claseEstado = opts.exito ? "status-success" : "status-error";
    const asunto = `[RPA LAD-6819] Resultado de procesamiento - ${opts.cliente.toUpperCase()} - ${estadoTexto}`;

    const now = new Date();
    const fecha = now.toISOString().replace("T", " ").substring(0, 19);

    const html = this.generarHtml({
      cliente: opts.cliente.toUpperCase(),
      estadoTexto,
      claseEstado,
      batchId: opts.batchId,
      totalArchivos: opts.archivoAdjuntoPath || opts.archivoAdjuntoBuffer ? "1 (Archivo adjunto)" : "0",
      fecha,
      mensaje: opts.mensaje,
    });

    const to = Array.from(new Set([...opts.destinatarios, this.config.adminEmail])).filter(Boolean);
    if (to.length === 0) {
      console.warn("[EmailService] No hay destinatarios para enviar el correo.");
      return false;
    }

    const attachments: Array<{ filename: string; content?: Buffer; path?: string }> = [];

    if (opts.archivoAdjuntoBuffer && opts.archivoAdjuntoNombre) {
      attachments.push({
        filename: opts.archivoAdjuntoNombre,
        content: opts.archivoAdjuntoBuffer,
      });
    } else if (opts.archivoAdjuntoPath && fs.existsSync(opts.archivoAdjuntoPath)) {
      attachments.push({
        filename: path.basename(opts.archivoAdjuntoPath),
        path: opts.archivoAdjuntoPath,
      });
    }

    try {
      await this.transporter.sendMail({
        from: `"RPA LAD-6819" <${this.config.smtp.user}>`,
        to: to.join(", "),
        subject: asunto,
        html,
        attachments,
      });

      console.log(`[EmailService] ✅ Correo enviado exitosamente a: ${to.join(", ")}`);
      return true;
    } catch (error) {
      console.error("[EmailService] ❌ Error enviando correo:", error);
      return false;
    }
  }
}

