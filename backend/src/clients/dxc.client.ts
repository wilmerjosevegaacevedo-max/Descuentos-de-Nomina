import { BaseClient } from "./base.client";

export class ClienteDXC extends BaseClient {
  constructor() {
    super("dxc");
  }

  public procesar(input: string | Buffer): boolean {
    const rows = this.leerExcel(input);

    if (rows.length === 0) {
      throw new Error("El archivo de DXC está vacío.");
    }

    // Layout 1: Pagos Netos
    const dfPagos = rows.map((row) => ({
      ID: row["ID"] ?? "",
      NOMBRE: row["NOMBRE"] ?? "",
      PAGO_NETO: row["PAGO_NETO"] ?? "",
    }));
    this.guardarExcel(dfPagos, `DXC_Pagos_${this.batchId}.xlsx`);

    // Layout 2: Deducciones
    const dfDeducciones = rows.map((row) => ({
      ID: row["ID"] ?? "",
      NOMBRE: row["NOMBRE"] ?? "",
      IMPUESTOS: row["IMPUESTOS"] ?? "",
      SEGURO: row["SEGURO"] ?? "",
    }));
    this.guardarExcel(dfDeducciones, `DXC_Deducciones_${this.batchId}.xlsx`);

    return true;
  }
}

