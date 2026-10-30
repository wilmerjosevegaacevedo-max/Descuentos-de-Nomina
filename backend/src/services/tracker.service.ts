import fs from "node:fs";
import path from "node:path";
import { getRPAConfig } from "../config";

interface RegistroItem {
  id: string;
  fecha: string;
  cliente: string;
  asunto: string;
  estado: string;
  mensaje?: string;
}

export class TrackerService {
  private filePath: string;

  constructor() {
    const config = getRPAConfig();
    this.filePath = path.join(config.filesBasePath, "data", "records.json");
    this.asegurarArchivo();
  }

  private asegurarArchivo(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({ procesados: [] }, null, 2), "utf-8");
    }
  }

  private leerRegistros(): RegistroItem[] {
    try {
      this.asegurarArchivo();
      const raw = fs.readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.procesados) ? parsed.procesados : [];
    } catch {
      return [];
    }
  }

  private guardarRegistros(procesados: RegistroItem[]): void {
    try {
      this.asegurarArchivo();
      fs.writeFileSync(this.filePath, JSON.stringify({ procesados }, null, 2), "utf-8");
    } catch (error) {
      console.error("[TrackerService] Error al guardar bitácora:", error);
    }
  }

  public yaFueProcesado(id: string): boolean {
    if (!id) return false;
    const items = this.leerRegistros();
    return items.some((item) => item.id === id && item.estado === "EXITOSO");
  }

  public registrarProceso(
    id: string,
    cliente: string,
    asunto: string,
    estado: "EXITOSO" | "FALLIDO" | "IGNORADO",
    mensaje = ""
  ): void {
    if (!id) return;
    const items = this.leerRegistros();
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    const nuevo: RegistroItem = {
      id,
      fecha: now,
      cliente,
      asunto,
      estado,
      mensaje,
    };

    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) {
      items[index] = nuevo;
    } else {
      items.push(nuevo);
    }

    this.guardarRegistros(items);
  }
}

