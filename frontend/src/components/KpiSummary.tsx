import { CLIENTES, Job, grupoEstado } from "../types";
import { esHoy, formatRelativeTime } from "../utils/format";

export function KpiSummary({ jobs }: { jobs: Job[] }) {
  const lotesHoy = jobs.filter((job) => esHoy(job.creadoEn?.toDate())).length;
  const exitosos = jobs.filter((job) => grupoEstado(job.estado) === "exito").length;
  const fallidos = jobs.filter((job) => grupoEstado(job.estado) === "fallo").length;
  const procesando = jobs.filter((job) => grupoEstado(job.estado) === "proceso").length;
  const total = jobs.length;
  const tasaEfectividad = total > 0 ? (exitosos / total) * 100 : 0;

  const clientesConLotes = new Set(jobs.map((job) => job.cliente.toLowerCase()));

  const ultimoLote = [...jobs].sort((a, b) => {
    const fechaA = a.creadoEn?.toDate()?.getTime() ?? 0;
    const fechaB = b.creadoEn?.toDate()?.getTime() ?? 0;
    return fechaB - fechaA;
  })[0];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-lg">
      {/* Card 1: Lotes procesados */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-md">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Lotes Registrados
            </span>
            <span className="font-headline-xl text-headline-xl text-on-surface mt-space-xs">
              {total} <span className="text-body-lg font-body-lg text-on-surface-variant font-normal">lotes</span>
            </span>
          </div>
          <div className="p-2 rounded-lg bg-surface-container text-primary">
            <span className="material-symbols-outlined text-[24px]">folder_zip</span>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs">
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            {lotesHoy} registrados hoy · {procesando} en curso
          </span>
          {total > 0 && (
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex gap-0.5">
              <div className="h-full bg-emerald-400" style={{ width: `${(exitosos / total) * 100}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${(procesando / total) * 100}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${(fallidos / total) * 100}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Tasa de efectividad */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-md">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Tasa de Efectividad
            </span>
            <span className="font-headline-xl text-headline-xl text-emerald-600 mt-space-xs">
              {total > 0 ? `${tasaEfectividad.toFixed(1)}%` : "—"}
            </span>
          </div>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-emerald-500"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${tasaEfectividad}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="material-symbols-outlined text-[16px] absolute text-emerald-600">verified</span>
          </div>
        </div>
        <div className="flex items-center justify-between font-body-xs text-body-xs pt-1">
          <span className="text-emerald-700 font-medium">{exitosos} exitosos</span>
          <span className="text-on-surface-variant">•</span>
          <span className="text-error font-medium">{fallidos} fallidos</span>
        </div>
      </div>

      {/* Card 3: Clientes configurados */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-md">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Clientes Configurados
            </span>
            <span className="font-headline-xl text-headline-xl text-on-surface mt-space-xs">
              {CLIENTES.length} <span className="text-body-lg font-body-lg text-on-surface-variant font-normal">empresas</span>
            </span>
          </div>
          <div className="p-2 rounded-lg bg-surface-container text-secondary">
            <span className="material-symbols-outlined text-[24px]">apartment</span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs flex-wrap">
          {CLIENTES.map((c) => (
            <span
              key={c.id}
              className={`px-2 py-0.5 font-code-sm text-code-sm rounded font-semibold ${
                clientesConLotes.has(c.id)
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Card 4: Último lote */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-md">
        <div className="flex items-start justify-between">
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Último Lote
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface mt-space-xs truncate">
              {ultimoLote ? ultimoLote.nombreArchivo : "Sin lotes aún"}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-surface-container text-primary">
            <span className="material-symbols-outlined text-[24px]">history</span>
          </div>
        </div>
        <div className="flex items-center justify-between font-body-xs text-body-xs">
          <span className="text-on-surface-variant">
            {ultimoLote ? formatRelativeTime(ultimoLote.creadoEn?.toDate()) : "—"}
          </span>
          {ultimoLote && (
            <span className="font-code-sm text-code-sm text-on-surface-variant">{ultimoLote.estado}</span>
          )}
        </div>
      </div>
    </section>
  );
}
