import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmpresaService } from "@/lib/empresas/empresa.service";
import { NotFoundError } from "@/lib/http/errors";
import type { EmpresaRepository } from "@/lib/empresas/empresa.repository";
import type { Empresa } from "@/lib/empresas/empresa.types";

const empresaMock: Empresa = {
  id: "uuid-1",
  nombre: "CDF Colombia SAS",
  nit: "900123456-1",
  email: "nomina@cdf.com.co",
  activa: true,
  creadaEn: new Date("2026-01-01"),
};

function crearRepoMock(): EmpresaRepository {
  return {
    listar: vi.fn().mockResolvedValue([empresaMock]),
    buscarPorId: vi.fn().mockResolvedValue(empresaMock),
    crear: vi.fn().mockResolvedValue(empresaMock),
    actualizar: vi.fn().mockResolvedValue({ ...empresaMock, nombre: "CDF Actualizado" }),
    eliminar: vi.fn().mockResolvedValue(undefined),
  };
}

describe("EmpresaService", () => {
  let repo: EmpresaRepository;
  let servicio: EmpresaService;

  beforeEach(() => {
    repo = crearRepoMock();
    servicio = new EmpresaService(repo);
  });

  it("listar() devuelve todas las empresas", async () => {
    const resultado = await servicio.listar();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nit).toBe("900123456-1");
    expect(repo.listar).toHaveBeenCalledOnce();
  });

  it("obtenerPorId() devuelve la empresa cuando existe", async () => {
    const empresa = await servicio.obtenerPorId("uuid-1");
    expect(empresa.id).toBe("uuid-1");
    expect(repo.buscarPorId).toHaveBeenCalledWith("uuid-1");
  });

  it("obtenerPorId() lanza NotFoundError cuando no existe", async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    await expect(servicio.obtenerPorId("no-existe")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("crear() delega al repositorio y devuelve la empresa", async () => {
    const input = {
      nombre: "CDF Colombia SAS",
      nit: "900123456-1",
      email: "nomina@cdf.com.co",
      activa: true,
    };
    const empresa = await servicio.crear(input);
    expect(empresa.id).toBe("uuid-1");
    expect(repo.crear).toHaveBeenCalledWith(input);
  });

  it("actualizar() lanza NotFoundError si la empresa no existe", async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    await expect(servicio.actualizar("no-existe", { nombre: "Nuevo" })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.actualizar).not.toHaveBeenCalled();
  });

  it("eliminar() lanza NotFoundError si la empresa no existe", async () => {
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    await expect(servicio.eliminar("no-existe")).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.eliminar).not.toHaveBeenCalled();
  });
});
