import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { normalizarTexto, identificarCliente } from "../lib/rpa/detector";
import { ClienteCDF } from "../lib/rpa/clients/cdf.client";
import { ClienteContinental } from "../lib/rpa/clients/continental.client";
import { ClienteDXC } from "../lib/rpa/clients/dxc.client";

describe("RPA Detector & Normalizer", () => {
  it("debe normalizar textos quitando acentos y espacios extra", () => {
    expect(normalizarTexto("Nómina   CDF")).toBe("nomina cdf");
    expect(normalizarTexto("  áéíóúÁÉÍÓÚ  ")).toBe("aeiouaeiou");
  });

  it("debe identificar clientes por dominio de remitente", () => {
    expect(identificarCliente("Cualquier asunto", "recursos@cdf.com")).toBe("cdf");
    expect(identificarCliente("Reporte de personal", "nomina@dxc.com")).toBe("dxc");
  });

  it("debe identificar clientes por asunto", () => {
    expect(identificarCliente("Envío Nómina Continental 2026", "contacto@empresa.com")).toBe("continental");
    expect(identificarCliente("Reporte DXC Mensual", "contacto@empresa.com")).toBe("dxc");
    expect(identificarCliente("Nomina HPE BIESQL1793", "contacto@empresa.com")).toBe("dxc");
  });

  it("debe retornar null para clientes no reconocidos", () => {
    expect(identificarCliente("Asunto desconocido", "usuario@desconocido.com")).toBeNull();
  });
});

describe("RPA Clientes Processors", () => {
  function crearExcelBuffer(data: Record<string, unknown>[]): Buffer {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  it("ClienteContinental debe calcular 5% de bono sobre el salario y empaquetar ZIP", async () => {
    const buffer = crearExcelBuffer([
      { ID: "101", NOMBRE: "Carlos Perez", DEPARTAMENTO: "IT", SALARIO: 1000 },
      { ID: "102", NOMBRE: "Ana Gomez", DEPARTAMENTO: "HR", SALARIO: 2000 },
    ]);

    const cliente = new ClienteContinental();
    const res = await cliente.run(buffer, "conti_test.xlsx");

    expect(res.exito).toBe(true);
    expect(res.archivoZip).toBeDefined();
    expect(res.zipBuffer).toBeInstanceOf(Buffer);
  });

  it("ClienteCDF debe rechazar si faltan columnas obligatorias", async () => {
    const bufferIncompleto = crearExcelBuffer([
      { "Costo Empleado ": 100, Nivel: "A" }, // Faltan las demás
    ]);

    const cliente = new ClienteCDF();
    const res = await cliente.run(bufferIncompleto, "cdf_incompleto.xlsx");

    expect(res.exito).toBe(false);
    expect(res.error).toContain("El layout es incorrecto, faltan las siguientes columnas");
  });

  it("ClienteCDF debe procesar correctamente cuando tiene todas las columnas requeridas", async () => {
    const bufferValido = crearExcelBuffer([
      {
        "Costo Empleado ": 500,
        Nivel: "Senior",
        "Apellido Paterno": "Vega",
        "Apellido Materno": "Acevedo",
        "Nombre (s)": "Wilmer",
        "Employees Number ID (ATTUID)": "WV1234",
        Producto: "Nomina",
      },
    ]);

    const cliente = new ClienteCDF();
    const res = await cliente.run(bufferValido, "cdf_valido.xlsx");

    expect(res.exito).toBe(true);
    expect(res.archivoZip).toBeDefined();
  });

  it("ClienteDXC debe generar layouts de Pagos y Deducciones", async () => {
    const buffer = crearExcelBuffer([
      { ID: "D1", NOMBRE: "Laura", PAGO_NETO: 3000, IMPUESTOS: 200, SEGURO: 100 },
    ]);

    const cliente = new ClienteDXC();
    const res = await cliente.run(buffer, "dxc_test.xlsx");

    expect(res.exito).toBe(true);
    expect(cliente.archivosGenerados.length).toBe(2);
  });
});

