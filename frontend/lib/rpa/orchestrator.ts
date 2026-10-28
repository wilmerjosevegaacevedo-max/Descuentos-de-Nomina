import fs from "node:fs";
import path from "node:path";
import { getRPAConfig } from "./config";
import { identificarCliente } from "./detector";
import { obtenerCliente } from "./clients";
import { MailboxService } from "./services/mailbox.service";
import { EmailService } from "./services/email.service";
import { TrackerService } from "./services/tracker.service";
import { registrarJobEnFirestore } from "./services/firebase.service";
import type { ProcessResult, RPARunSummary } from "./types";

export class RPAOrchestrator {
  private mailboxSvc = new MailboxService();
  private emailSvc = new EmailService();
  private tracker = new TrackerService();
  private config = getRPAConfig();

  /**
   * Procesa un archivo puntual de un cliente (Modo Manual o vía API Web).
   */
  public async procesarArchivoCliente(
    nombreCliente: string,
    archivo: string | Buffer,
    filename = "archivo.xlsx"
  ): Promise<ProcessResult> {
    const cliente = obtenerCliente(nombreCliente);
    if (!cliente) {
      return {
        cliente: nombreCliente,
        batchId: "N/A",
        exito: false,
        error: `Cliente no soportado: '${nombreCliente}'. Clientes válidos: cdf, continental, dxc.`,
      };
    }

    return cliente.run(archivo, filename);
  }

  /**
   * Ejecuta el escaneo de Gmail, procesa planillas y envía notificaciones automáticas.
   */
  public async ejecutarModoBuzon(maxCorreos = 20): Promise<RPARunSummary> {
    const summary: RPARunSummary = {
      ejecutadoEn: new Date().toISOString(),
      totalCorreos: 0,
      procesados: 0,
      exitosos: 0,
      fallidos: 0,
      ignorados: 0,
      resultados: [],
    };

    console.log("[RPAOrchestrator] Conectando a Gmail (IMAP)...");
    const conectado = await this.mailboxSvc.conectar();
    if (!conectado) {
      console.error("[RPAOrchestrator] No se pudo conectar al buzón IMAP.");
      return summary;
    }

    try {
      const correos = await this.mailboxSvc.obtenerCorreosPendientes(maxCorreos);
      summary.totalCorreos = correos.length;

      if (correos.length === 0) {
        console.log("[RPAOrchestrator] El buzón está al día. No hay correos pendientes.");
        return summary;
      }

      console.log(`[RPAOrchestrator] Se encontraron ${correos.length} correos nuevos.`);

      for (const correo of correos) {
        const correoId = correo.messageId || correo.id;

        // 1. Evitar re-procesamiento duplicado
        if (this.tracker.yaFueProcesado(correoId)) {
          console.warn(`[RPAOrchestrator] Correo '${correo.subject}' ya fue procesado con éxito anteriormente.`);
          await this.mailboxSvc.marcarComoLeido(correo.id);
          summary.ignorados++;
          summary.resultados.push({
            correoId,
            asunto: correo.subject,
            remitente: correo.senderAddress,
            cliente: "N/A",
            estado: "IGNORADO",
            mensaje: "Correo duplicado ya procesado",
          });
          continue;
        }

        // 2. Verificar adjuntos válidos
        if (!correo.attachments || correo.attachments.length === 0) {
          console.warn(`[RPAOrchestrator] Correo '${correo.subject}' no contiene archivos Excel válidos.`);
          await this.mailboxSvc.marcarComoLeido(correo.id);
          this.tracker.registrarProceso(correoId, "N/A", correo.subject, "IGNORADO", "Sin adjuntos válidos");
          await registrarJobEnFirestore(correoId, "N/A", "IGNORADO", "Sin adjuntos válidos");
          summary.ignorados++;
          summary.resultados.push({
            correoId,
            asunto: correo.subject,
            remitente: correo.senderAddress,
            cliente: "N/A",
            estado: "IGNORADO",
            mensaje: "Sin adjuntos Excel válidos",
          });
          continue;
        }

        // 3. Identificar cliente por asunto y remitente
        const clienteNombre = identificarCliente(correo.subject, correo.senderAddress);
        if (!clienteNombre) {
          console.error(`[RPAOrchestrator] No se pudo identificar cliente para el asunto: '${correo.subject}'`);
          await this.mailboxSvc.moverCorreo(correo.id, false);
          this.tracker.registrarProceso(correoId, "DESCONOCIDO", correo.subject, "FALLIDO", "Cliente no identificado");
          await registrarJobEnFirestore(correoId, "DESCONOCIDO", "FALLIDO", "Cliente no identificado");
          summary.fallidos++;
          summary.resultados.push({
            correoId,
            asunto: correo.subject,
            remitente: correo.senderAddress,
            cliente: "DESCONOCIDO",
            estado: "FALLIDO",
            mensaje: "Cliente no identificado",
          });
          continue;
        }

        console.log(`[RPAOrchestrator] Procesando correo de cliente '${clienteNombre}': '${correo.subject}'`);
        let exitoGlobal = true;
        let ultimoBatchId = "";

        for (const adjunto of correo.attachments) {
          const resultado = await this.procesarArchivoCliente(clienteNombre, adjunto.content, adjunto.filename);
          ultimoBatchId = resultado.batchId;

          if (!resultado.exito) {
            exitoGlobal = false;
            const plantillaPath = path.join(this.config.filesBasePath, "templates", `plantilla_${clienteNombre}.xlsx`);
            const plantillaExiste = fs.existsSync(plantillaPath);

            await this.emailSvc.enviarReporte({
              destinatarios: [correo.senderAddress, this.config.adminEmail],
              cliente: clienteNombre,
              batchId: resultado.batchId,
              exito: false,
              mensaje: `${resultado.error || "Error al procesar archivo."}<br><br><b>Nota:</b> Verifique que las columnas y datos cumplan con la plantilla requerida.`,
              archivoAdjuntoPath: plantillaExiste ? plantillaPath : undefined,
            });
          } else {
            await this.emailSvc.enviarReporte({
              destinatarios: [correo.senderAddress, this.config.adminEmail],
              cliente: clienteNombre,
              batchId: resultado.batchId,
              exito: true,
              mensaje: "Los archivos fueron procesados y validados correctamente.",
              archivoAdjuntoPath: resultado.archivoZip,
              archivoAdjuntoBuffer: resultado.zipBuffer,
              archivoAdjuntoNombre: `${clienteNombre}_procesado_${resultado.batchId}.zip`,
            });
          }
        }

        const estadoFinal = exitoGlobal ? "EXITOSO" : "FALLIDO";
        this.tracker.registrarProceso(correoId, clienteNombre, correo.subject, estadoFinal);
        await registrarJobEnFirestore(correoId, clienteNombre, estadoFinal, exitoGlobal ? "" : "Fallo en validación", ultimoBatchId);
        await this.mailboxSvc.moverCorreo(correo.id, exitoGlobal);

        summary.procesados++;
        if (exitoGlobal) summary.exitosos++;
        else summary.fallidos++;

        summary.resultados.push({
          correoId,
          asunto: correo.subject,
          remitente: correo.senderAddress,
          cliente: clienteNombre,
          estado: estadoFinal,
          mensaje: exitoGlobal ? "Procesado exitosamente" : "Error en procesamiento",
          batchId: ultimoBatchId,
        });
      }
    } finally {
      await this.mailboxSvc.desconectar();
    }

    return summary;
  }
}

