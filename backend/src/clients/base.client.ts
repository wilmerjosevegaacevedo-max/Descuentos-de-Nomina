import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import * as XLSX from "xlsx";
import { getRPAConfig } from "../config";
import type { ProcessResult } from "../types";

export abstract class BaseClient {
  public nombreCliente: string;
  public batchId: string;
  public workDir: string;
  public archivosGenerados: Array<{ filename: string; filepath: string; buffer: Buffer }> = [];

  constructor(nombreCliente: string) {
    this.nombreCliente = nombreCliente;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    this.batchId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
      now.getHours()
    )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const config = getRPAConfig();
    this.workDir = path.join(config.filesBasePath, this.nombreCliente, this.batchId);
  }

  public prepararEntorno(): void {
    if (!fs.existsSync(this.workDir)) {
      fs.mkdirSync(this.workDir, { recursive: true });
    }
  }

  public leerExcel(input: string | Buffer): Record<string, unknown>[] {
    let workbook: XLSX.WorkBook;
    if (typeof input === "string") {
      workbook = XLSX.readFile(input);
    } else {
      workbook = XLSX.read(input, { type: "buffer" });
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("El archivo Excel no contiene ninguna hoja válida.");
    }

    const sheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  }

  public guardarExcel(
    data: Record<string, unknown>[],
    nombreArchivo: string,
    sheetName = "Datos"
  ): { filepath: string; buffer: Buffer } {
    this.prepararEntorno();

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const filepath = path.join(this.workDir, nombreArchivo);
    fs.writeFileSync(filepath, buffer);

    const item = { filename: nombreArchivo, filepath, buffer };
    this.archivosGenerados.push(item);
    return item;
  }

  public empaquetarArchivos(): { zipPath: string; zipBuffer: Buffer } {
    if (this.archivosGenerados.length === 0) {
      throw new Error(`[${this.nombreCliente}] No hay archivos generados para empaquetar.`);
    }

    const zip = new AdmZip();
    for (const archivo of this.archivosGenerados) {
      zip.addFile(archivo.filename, archivo.buffer);
    }

    const zipFilename = `${this.nombreCliente}_procesado_${this.batchId}.zip`;
    const parentDir = path.dirname(this.workDir);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const zipPath = path.join(parentDir, zipFilename);
    const zipBuffer = zip.toBuffer();
    fs.writeFileSync(zipPath, zipBuffer);

    return { zipPath, zipBuffer };
  }

  public abstract procesar(input: string | Buffer): Promise<boolean> | boolean;

  public async run(input: string | Buffer, inputFilename = "archivo.xlsx"): Promise<ProcessResult> {
    const resultado: ProcessResult = {
      cliente: this.nombreCliente,
      batchId: this.batchId,
      exito: false,
    };

    try {
      this.prepararEntorno();

      const exito = await this.procesar(input);
      if (!exito) {
        resultado.error = "La lógica de negocio retornó fallo.";
        return resultado;
      }

      const { zipPath, zipBuffer } = this.empaquetarArchivos();
      resultado.exito = true;
      resultado.archivoZip = zipPath;
      resultado.zipBuffer = zipBuffer;
      resultado.detalles = `Se procesaron y empaquetaron ${this.archivosGenerados.length} archivos en el ZIP.`;
    } catch (error) {
      resultado.error = error instanceof Error ? error.message : String(error);
    }

    return resultado;
  }
}

