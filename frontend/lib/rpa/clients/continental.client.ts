import { BaseClient } from "./base.client";

export class ClienteContinental extends BaseClient {
  constructor() {
    super("continental");
  }

  public procesar(input: string | Buffer): boolean {
    const rows = this.leerExcel(input);

    if (rows.length === 0) {
      throw new Error("El archivo de Continental está vacío.");
    }

    // 1. Filtrar filas totalmente vacías
    const filtrados = rows.filter((row) =>
      Object.values(row).some((val) => val !== null && val !== undefined && String(val).trim() !== "")
    );

    // 2. Lógica de Bonos
    const procesados = filtrados.map((row) => {
      const nuevo = { ...row };
      if ("SALARIO" in nuevo) {
        const salario = Number(nuevo["SALARIO"]) || 0;
        nuevo["BONO_CALCULADO"] = Number((salario * 0.05).toFixed(2));
      }
      return nuevo;
    });

    // 3. Guardar archivo
    const nombreSalida = `Continental_Calculo_${this.batchId}.xlsx`;
    this.guardarExcel(procesados, nombreSalida);

    return true;
  }
}

