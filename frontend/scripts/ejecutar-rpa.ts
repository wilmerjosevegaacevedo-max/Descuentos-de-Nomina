import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

// Cargar variables de entorno de .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import { RPAOrchestrator } from "../lib/rpa/orchestrator";

async function main() {
  console.log("=======================================================");
  console.log("🤖 Iniciando Motor RPA LAD-6819 (TypeScript / Node.js)");
  console.log("=======================================================");
  console.log(`Fecha y hora: ${new Date().toLocaleString()}`);
  console.log("");

  const args = process.argv.slice(2);
  let cliente = "";
  let archivo = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cliente" && args[i + 1]) {
      cliente = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === "--archivo" && args[i + 1]) {
      archivo = args[i + 1];
      i++;
    }
  }

  const orchestrator = new RPAOrchestrator();

  if (cliente && archivo) {
    console.log(`[Modo Manual] Cliente: ${cliente.toUpperCase()} | Archivo: ${archivo}`);
    if (!fs.existsSync(archivo)) {
      console.error(`❌ El archivo especificado no existe: ${archivo}`);
      process.exit(1);
    }

    const buffer = fs.readFileSync(archivo);
    const resultado = await orchestrator.procesarArchivoCliente(cliente, buffer, path.basename(archivo));

    if (resultado.exito) {
      console.log(`✅ Procesamiento exitoso.`);
      console.log(`📦 Archivo ZIP generado en: ${resultado.archivoZip}`);
    } else {
      console.error(`❌ Fallo en el procesamiento: ${resultado.error}`);
      process.exit(1);
    }
  } else if (cliente || archivo) {
    console.error("❌ ERROR: Para el modo manual debes enviar tanto --cliente como --archivo.");
    process.exit(1);
  } else {
    console.log("📬 [Modo Buzón] Escaneando correos en Gmail (IMAP)...");
    const summary = await orchestrator.ejecutarModoBuzon(20);
    console.log("");
    console.log("=======================================================");
    console.log("📊 Resumen de Ejecución:");
    console.log(`  - Total correos escaneados : ${summary.totalCorreos}`);
    console.log(`  - Procesados               : ${summary.procesados}`);
    console.log(`  - Exitosos                 : ${summary.exitosos}`);
    console.log(`  - Fallidos                 : ${summary.fallidos}`);
    console.log(`  - Ignorados                : ${summary.ignorados}`);
    console.log("=======================================================");
  }
}

main().catch((err) => {
  console.error("❌ Error no controlado en el orquestador RPA:", err);
  process.exit(1);
});

