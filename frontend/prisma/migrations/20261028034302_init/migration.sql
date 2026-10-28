-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creada_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "planillas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresa_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "total_pagos" REAL NOT NULL DEFAULT 0,
    "creada_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "planillas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nit_key" ON "empresas"("nit");
