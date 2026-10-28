import { prisma } from "../lib/prisma";

async function main() {
  const empresa1 = await prisma.empresa.upsert({
    where: { nit: "900123456-1" },
    update: {},
    create: {
      nombre: "CDF Colombia SAS",
      nit: "900123456-1",
      email: "nomina@cdf.com.co",
      activa: true,
    },
  });

  const empresa2 = await prisma.empresa.upsert({
    where: { nit: "800987654-2" },
    update: {},
    create: {
      nombre: "Continental Logistics",
      nit: "800987654-2",
      email: "rrhh@continental.co",
      activa: true,
    },
  });

  await prisma.planilla.deleteMany();
  await prisma.planilla.createMany({
    data: [
      { empresaId: empresa1.id, periodo: "2026-10", estado: "EXITOSO", totalPagos: 15000000 },
      { empresaId: empresa1.id, periodo: "2026-09", estado: "EXITOSO", totalPagos: 14800000 },
      { empresaId: empresa2.id, periodo: "2026-10", estado: "PENDIENTE", totalPagos: 0 },
    ],
  });

  console.log("Seed listo: 2 empresas y 3 planillas");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
