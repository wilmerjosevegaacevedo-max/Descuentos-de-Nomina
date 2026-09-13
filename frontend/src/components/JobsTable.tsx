import { useMemo, useState } from "react";
import { CLIENTES, Job, grupoEstado } from "../types";
import { formatRelativeTime } from "../utils/format";

type FiltroEstado = "todos" | "proceso" | "exito" | "fallo";

type JobsTableProps = {
  jobs: Job[];
  onSelectJob: (jobId: string) => void;
  onReintentar: (jobId: string) => void;
  reintentandoId: string | null;
};

function badgeEstado(job: Job) {
  const grupo = grupoEstado(job.estado);
  if (grupo === "proceso") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-code-sm text-code-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        {job.estado.toUpperCase()}
      </span>
    );
  }
  if (grupo === "exito") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-code-sm text-code-sm font-semibold">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        {job.estado.toUpperCase()}
      </span>
    );
  }
  if (grupo === "fallo") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded font-code-sm text-code-sm font-semibold">
        <span className="material-symbols-outlined text-[14px]">error</span>
        {job.estado.toUpperCase()}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-on-surface-variant rounded font-code-sm text-code-sm font-semibold">
      {job.estado.toUpperCase()}
    </span>
  );
}

export function JobsTable({ jobs, onSelectJob, onReintentar, reintentandoId }: JobsTableProps) {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const conteos = useMemo(
    () => ({
      todos: jobs.length,
      proceso: jobs.filter((j) => grupoEstado(j.estado) === "proceso").length,
      exito: jobs.filter((j) => grupoEstado(j.estado) === "exito").length,
      fallo: jobs.filter((j) => grupoEstado(j.estado) === "fallo").length,
    }),
    [jobs],
  );

  const jobsFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return jobs.filter((job) => {
      if (filtroEstado !== "todos" && grupoEstado(job.estado) !== filtroEstado) return false;
      if (filtroCliente && job.cliente.toLowerCase() !== filtroCliente.toLowerCase()) return false;
      if (
        termino &&
        !job.id.toLowerCase().includes(termino) &&
        !job.nombreArchivo.toLowerCase().includes(termino) &&
        !job.cliente.toLowerCase().includes(termino)
      ) {
        return false;
      }
      return true;
    });
  }, [jobs, filtroEstado, filtroCliente, busqueda]);

  return (
    <div className="xl:col-span-8 flex flex-col gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Monitor en Vivo de Lotes RPA</h2>
          </div>
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            Sincronizado vía Firestore onSnapshot en tiempo real
          </span>
        </div>

        <div className="flex items-center gap-space-xs flex-wrap">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-semibold ${
              filtroEstado === "todos" ? "bg-surface-container-high text-on-surface" : "bg-surface-container text-on-surface-variant"
            }`}
            type="button"
          >
            Todos ({conteos.todos})
          </button>
          <button
            onClick={() => setFiltroEstado("proceso")}
            className={`px-space-sm py-1 rounded-lg font-code-sm text-code-sm font-medium flex items-center gap-1 ${
              filtroEstado === "proceso" ? "bg-amber-100 text-amber-900" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> PROCESANDO ({conteos.proceso})
          </button>
          <button
            onClick={() => setFiltroEstado("exito")}
            className={`px-space-sm py-1 rounded-lg font-code-sm text-code-sm font-medium flex items-center gap-1 ${
              filtroEstado === "exito" ? "bg-emerald-100 text-emerald-900" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> EXITOSO ({conteos.exito})
          </button>
          <button
            onClick={() => setFiltroEstado("fallo")}
            className={`px-space-sm py-1 rounded-lg font-code-sm text-code-sm font-medium flex items-center gap-1 ${
              filtroEstado === "fallo" ? "bg-red-100 text-red-900" : "bg-red-50 text-red-800 hover:bg-red-100"
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-red-600" /> FALLIDO ({conteos.fallo})
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-space-sm">
        <div className="relative w-full sm:flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest shadow-inner transition-colors"
            placeholder="Buscar por Batch ID, archivo o cliente..."
            type="text"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
        <select
          aria-label="Filtrar por Cliente"
          className="w-full sm:w-48 px-3 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest"
          value={filtroCliente}
          onChange={(event) => setFiltroCliente(event.target.value)}
        >
          <option value="">Cliente: Todos</option>
          {CLIENTES.map((c) => (
            <option key={c.id} value={c.id}>
              Cliente: {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm text-label-sm tracking-wider">
              <th className="py-2.5 px-space-md rounded-l-lg">Batch ID</th>
              <th className="py-2.5 px-space-md">Cliente</th>
              <th className="py-2.5 px-space-md">Archivo Origen</th>
              <th className="py-2.5 px-space-md">Estado</th>
              <th className="py-2.5 px-space-md">Timestamp</th>
              <th className="py-2.5 px-space-md text-right rounded-r-lg">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {jobsFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center font-body-sm text-body-sm text-on-surface-variant">
                  No hay lotes que coincidan con el filtro actual.
                </td>
              </tr>
            )}
            {jobsFiltrados.map((job) => {
              const grupo = grupoEstado(job.estado);
              return (
                <tr
                  key={job.id}
                  className={`hover:bg-surface-container-low/60 transition-colors cursor-pointer ${
                    grupo === "proceso" ? "bg-primary/5" : grupo === "fallo" ? "bg-red-50/40" : ""
                  }`}
                  onClick={() => onSelectJob(job.id)}
                >
                  <td className="py-3 px-space-md">
                    <span className="font-code-sm text-code-sm font-semibold text-primary">{job.id}</span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary font-code-sm text-code-sm rounded font-semibold">
                      {job.cliente.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-body-sm text-body-sm font-medium text-on-surface truncate max-w-[200px] block">
                      {job.nombreArchivo}
                    </span>
                  </td>
                  <td className="py-3 px-space-md">
                    <div className="flex flex-col gap-1">
                      {badgeEstado(job)}
                      {job.error && (
                        <span className="font-code-sm text-[11px] text-error truncate max-w-[210px]" title={job.error}>
                          {job.error}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-body-xs text-body-xs text-on-surface-variant">
                      {formatRelativeTime(job.creadoEn?.toDate())}
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-right" onClick={(event) => event.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      {job.archivoSalida && (
                        <a
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            onSelectJob(job.id);
                          }}
                          className="inline-flex items-center gap-1 px-space-sm py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-label-sm font-label-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          <span>Ver ZIP</span>
                        </a>
                      )}
                      {grupo === "fallo" && (
                        <button
                          type="button"
                          disabled={reintentandoId === job.id}
                          onClick={() => onReintentar(job.id)}
                          className="inline-flex items-center gap-1 px-space-sm py-1 bg-red-100 text-error hover:bg-red-200 rounded text-label-sm font-label-sm transition-colors disabled:opacity-60"
                        >
                          <span className={`material-symbols-outlined text-[14px] ${reintentandoId === job.id ? "animate-spin" : ""}`}>
                            {reintentandoId === job.id ? "sync" : "replay"}
                          </span>
                          <span>Reintentar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-body-xs text-body-xs">
        <span>
          Mostrando {jobsFiltrados.length} de {jobs.length} lotes registrados
        </span>
      </div>
    </div>
  );
}
