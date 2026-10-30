import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { getRPAConfig } from "../config";
import type { AttachmentItem, EmailMessageItem } from "../types";

export class MailboxService {
  private config = getRPAConfig();
  private client: ImapFlow | null = null;

  public async conectar(): Promise<boolean> {
    try {
      this.client = new ImapFlow({
        host: this.config.mailbox.host,
        port: this.config.mailbox.port,
        secure: true,
        auth: {
          user: this.config.mailbox.user,
          pass: this.config.mailbox.pass,
        },
        logger: false,
      });

      await this.client.connect();
      await this.asegurarCarpetas();
      return true;
    } catch (error) {
      console.error("[MailboxService] Error al conectar por IMAP:", error);
      return false;
    }
  }

  public async desconectar(): Promise<void> {
    if (this.client) {
      try {
        await this.client.logout();
      } catch {
        // Ignorar error al cerrar
      }
      this.client = null;
    }
  }

  private async asegurarCarpetas(): Promise<void> {
    if (!this.client) return;
    const carpetas = [this.config.mailbox.processedFolder, this.config.mailbox.errorFolder];
    for (const carpeta of carpetas) {
      try {
        await this.client.mailboxCreate(carpeta);
      } catch {
        // La carpeta ya existe
      }
    }
  }

  public async obtenerCorreosPendientes(max = 20): Promise<EmailMessageItem[]> {
    if (!this.client) {
      const conectado = await this.conectar();
      if (!conectado || !this.client) return [];
    }

    const lock = await this.client.getMailboxLock(this.config.mailbox.folder);
    const correos: EmailMessageItem[] = [];

    try {
      // Buscar correos no leídos (UNSEEN)
      const uids = await this.client.search({ seen: false });
      if (!uids || uids.length === 0) {
        return [];
      }

      const uidsToFetch = uids.slice(0, max);
      for (const uid of uidsToFetch) {
        const download = await this.client.download(String(uid));
        if (!download || !download.content) continue;

        const parsed = await simpleParser(download.content);
        const attachments: AttachmentItem[] = [];

        if (parsed.attachments && parsed.attachments.length > 0) {
          for (const att of parsed.attachments) {
            const filename = att.filename || "archivo.xlsx";
            // Aceptar hojas de cálculo .xlsx, .xls, .csv
            if (/\.(xlsx|xls|csv)$/i.test(filename)) {
              attachments.push({
                filename,
                content: att.content,
                contentType: att.contentType,
              });
            }
          }
        }

        const senderAddress = parsed.from?.value?.[0]?.address || "";
        const senderName = parsed.from?.value?.[0]?.name || senderAddress;

        correos.push({
          id: String(uid),
          messageId: parsed.messageId || String(uid),
          subject: parsed.subject || "Sin Asunto",
          sender: senderName,
          senderAddress,
          date: parsed.date,
          attachments,
        });
      }
    } finally {
      lock.release();
    }

    return correos;
  }

  public async marcarComoLeido(uid: string): Promise<void> {
    if (!this.client) return;
    const lock = await this.client.getMailboxLock(this.config.mailbox.folder);
    try {
      await this.client.messageFlagsAdd({ uid: Number(uid) }, ["\\Seen"]);
    } catch (error) {
      console.warn(`[MailboxService] No se pudo marcar como leído el correo UID ${uid}:`, error);
    } finally {
      lock.release();
    }
  }

  public async moverCorreo(uid: string, exito: boolean): Promise<void> {
    if (!this.client) return;
    const destino = exito ? this.config.mailbox.processedFolder : this.config.mailbox.errorFolder;
    const lock = await this.client.getMailboxLock(this.config.mailbox.folder);
    try {
      await this.client.messageMove({ uid: Number(uid) }, destino);
    } catch (error) {
      console.warn(`[MailboxService] No se pudo mover el correo UID ${uid} a ${destino}:`, error);
    } finally {
      lock.release();
    }
  }
}

