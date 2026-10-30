import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { executeRpaCycle } from "./orchestrator";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Endpoint raíz
app.get("/", (_req, res) => {
  res.json({
    sistema: "Orquestador RPA LAD-6819 - Backend REST API",
    version: "2.0.0",
    tecnologia: "TypeScript / Node.js puro",
    estado: "OPERATIVO",
    endpoints: [
      "GET  /api/health",
      "POST /api/rpa/scan",
      "POST /api/nomina/procesar",
      "POST /api/pagos/individual",
      "GET  /api/empresas"
    ]
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    servicio: "rpa-backend",
    timestamp: new Date().toISOString(),
    uptimeSegundos: Math.floor(process.uptime())
  });
});

// Disparar escaneo IMAP / RPA
app.post("/api/rpa/scan", async (_req, res) => {
  try {
    console.log("[API] Solicitud de escaneo manual RPA recibida");
    const resultado = await executeRpaCycle();
    res.json({
      mensaje: "Ciclo RPA ejecutado con éxito",
      resultado
    });
  } catch (error: any) {
    console.error("[API] Error al ejecutar ciclo RPA:", error);
    res.status(500).json({
      error: "Error interno al ejecutar ciclo RPA",
      detalle: error.message
    });
  }
});

// Empresas predeterminadas y reglas de negocio
const EMPRESAS = [
  {
    id: "continental",
    nombre: "Continental Gold",
    nit: "900.123.456-7",
    codigo: "CONT",
    reglas: {
      porcentajeVida: 1.5,
      porcentajeGmm: 2.5,
      porcentajeCostos: 0.8,
      topeMaximoDescuento: 600000,
      permiteSobregiro: false
    }
  },
  {
    id: "cdf",
    nombre: "Compañía de Financiamiento CDF",
    nit: "800.987.654-1",
    codigo: "CDF",
    reglas: {
      porcentajeVida: 1.8,
      porcentajeGmm: 2.0,
      porcentajeCostos: 1.0,
      topeMaximoDescuento: 450000,
      permiteSobregiro: false
    }
  },
  {
    id: "dxc",
    nombre: "DXC Technology Colombia",
    nit: "860.555.444-9",
    codigo: "DXC",
    reglas: {
      porcentajeVida: 2.0,
      porcentajeGmm: 3.0,
      porcentajeCostos: 1.2,
      topeMaximoDescuento: 800000,
      permiteSobregiro: true
    }
  }
];

app.get("/api/empresas", (_req, res) => {
  res.json({ empresas: EMPRESAS });
});

// Procesar deducciones de nómina
app.post("/api/nomina/procesar", (req, res) => {
  const { empresaId, empleados } = req.body;
  if (!empresaId || !Array.isArray(empleados)) {
    return res.status(400).json({ error: "Parámetros inválidos. Se requiere empresaId y array de empleados." });
  }

  const empresa = EMPRESAS.find((e) => e.id === empresaId) || EMPRESAS[0];
  const { porcentajeVida, porcentajeGmm, porcentajeCostos, topeMaximoDescuento, permiteSobregiro } = empresa.reglas;
  const porcentajeTotal = porcentajeVida + porcentajeGmm + porcentajeCostos;

  const procesados = empleados.map((emp: any) => {
    const salario = Number(emp.salario || emp.salarioBase || 0);
    const montoTeorico = Math.round(salario * (porcentajeTotal / 100));
    const descuentoFinal = montoTeorico > topeMaximoDescuento && !permiteSobregiro ? topeMaximoDescuento : montoTeorico;

    return {
      documento: emp.documento || emp.cedula,
      nombre: emp.nombre || emp.empleado,
      salarioBase: salario,
      descuentoCalculado: descuentoFinal,
      salarioNeto: Math.max(0, salario - descuentoFinal),
      estado: "EXITOSO"
    };
  });

  const totalDeducciones = procesados.reduce((acc, cur) => acc + cur.descuentoCalculado, 0);

  return res.json({
    loteId: `LOTE-${Date.now().toString().slice(-6)}`,
    empresa: empresa.nombre,
    totalEmpleados: procesados.length,
    totalDeducciones,
    registros: procesados
  });
});

// Registrar descuento individual
app.post("/api/pagos/individual", (req, res) => {
  const { documento, empleadoNombre, empresaId, salarioBase, concepto, observacion } = req.body;

  if (!documento || !empleadoNombre || !salarioBase) {
    return res.status(400).json({ error: "Documento, empleadoNombre y salarioBase son obligatorios." });
  }

  const empresa = EMPRESAS.find((e) => e.id === empresaId) || EMPRESAS[0];
  const { porcentajeVida, porcentajeGmm, porcentajeCostos, topeMaximoDescuento, permiteSobregiro } = empresa.reglas;

  let pct = porcentajeVida + porcentajeGmm + porcentajeCostos;
  if (concepto === "Vida") pct = porcentajeVida;
  else if (concepto === "GMM") pct = porcentajeGmm;
  else if (concepto === "Costos") pct = porcentajeCostos;

  const montoTeorico = Math.round(Number(salarioBase) * (pct / 100));
  const descuentoFinal = montoTeorico > topeMaximoDescuento && !permiteSobregiro ? topeMaximoDescuento : montoTeorico;

  const nuevoId = `PAGO-IND-${Date.now().toString().slice(-6)}`;

  res.json({
    id: nuevoId,
    documento,
    empleadoNombre,
    empresaId: empresa.id,
    concepto: concepto || "Total",
    salarioBase: Number(salarioBase),
    descuentoCalculado: descuentoFinal,
    salarioNeto: Number(salarioBase) - descuentoFinal,
    fecha: new Date().toLocaleDateString("es-CO"),
    estado: "EXITOSO",
    observacion: observacion || `Descuento individual procesado para ${empresa.nombre}`
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor Backend RPA LAD-6819 iniciado en puerto ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
