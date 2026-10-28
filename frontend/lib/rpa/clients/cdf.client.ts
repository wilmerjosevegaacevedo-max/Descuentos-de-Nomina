import { BaseClient } from "./base.client";

export class ClienteCDF extends BaseClient {
  constructor() {
    super("cdf");
  }

  public procesar(input: string | Buffer): boolean {
    const rows = this.leerExcel(input);

    if (rows.length === 0) {
      throw new Error("El archivo de CDF está vacío.");
    }

    const firstRow = rows[0];
    const columnsPresent = Object.keys(firstRow);

    const columnasRequeridas = [
      "Costo Empleado ",
      "Nivel",
      "Apellido Paterno",
      "Apellido Materno",
      "Nombre (s)",
      "Employees Number ID (ATTUID)",
      "Producto",
    ];

    // Regla A: Validación de columnas requeridas
    const faltantes = columnasRequeridas.filter((col) => !columnsPresent.includes(col));
    if (faltantes.length > 0) {
      throw new Error(
        `Archivo rechazado. El layout es incorrecto, faltan las siguientes columnas: ${faltantes.join(
          ", "
        )}`
      );
    }

    // Regla B: Costo Empleado no nulo
    for (const row of rows) {
      const costoVal = row["Costo Empleado "];
      if (costoVal === undefined || costoVal === null || costoVal === "") {
        throw new Error(
          "Rechazado. Se encontraron celdas en blanco en la columna 'Costo Empleado '. Corrija el archivo y vuelva a enviarlo."
        );
      }
    }

    // Regla C: Filtrar costos mayores a 0 y transformar
    const procesados: Record<string, unknown>[] = [];
    for (const row of rows) {
      const costo = Number(row["Costo Empleado "]);
      if (Number.isNaN(costo) || costo <= 0) {
        continue;
      }

      const nuevoRegistro: Record<string, unknown> = { ...row };
      nuevoRegistro["Apellido Paterno"] = String(row["Apellido Paterno"] ?? "").trim();
      nuevoRegistro["Apellido Materno"] = String(row["Apellido Materno"] ?? "").trim();
      nuevoRegistro["Nombre (s)"] = String(row["Nombre (s)"] ?? "").trim();

      // Renombrar columna
      nuevoRegistro["NUMERO DE EMPLEADO"] = row["Employees Number ID (ATTUID)"];
      delete nuevoRegistro["Employees Number ID (ATTUID)"];

      procesados.push(nuevoRegistro);
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fechaEj = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const nombreSalida = `CDF_Layout_Procesado_${fechaEj}.xlsx`;

    this.guardarExcel(procesados, nombreSalida);
    return true;
  }
}

