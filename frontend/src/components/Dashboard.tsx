import type { User } from "firebase/auth";
import { ClienteId, Job } from "../types";
import { DashboardHeader } from "./DashboardHeader";
import { KpiSummary } from "./KpiSummary";
import { UploadPanel } from "./UploadPanel";
import { JobsTable } from "./JobsTable";
import { JobDrawer } from "./JobDrawer";
import { SystemStatusBar } from "./SystemStatusBar";

type DashboardProps = {
  user: User;
  jobs: Job[];
  cliente: ClienteId;
  onClienteChange: (value: ClienteId) => void;
  archivo: File | null;
  onArchivoChange: (file: File | null) => void;
  isSubmitting: boolean;
  lastDispatchedJobId: string | null;
  uploadError: string;
  onDespachar: () => void;
  selectedJobId: string | null;
  onSelectJob: (jobId: string | null) => void;
  onReintentar: (jobId: string) => void;
  reintentandoId: string | null;
  onSignOut: () => void;
};

export function Dashboard({
  user,
  jobs,
  cliente,
  onClienteChange,
  archivo,
  onArchivoChange,
  isSubmitting,
  lastDispatchedJobId,
  uploadError,
  onDespachar,
  selectedJobId,
  onSelectJob,
  onReintentar,
  reintentandoId,
  onSignOut,
}: DashboardProps) {
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;

  return (
    <div className="w-full min-h-screen bg-background">
      <DashboardHeader user={user} onSignOut={onSignOut} />
      <main className="w-full pt-16 bg-background">
        <div className="w-full px-margin-lg py-margin flex flex-col gap-space-xl">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="px-space-sm py-0.5 bg-primary-container text-on-primary font-code-sm text-code-sm rounded">
                FASTAPI
              </span>
              <span className="font-body-xs text-body-xs text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Orquestador conectado en tiempo real vía Firestore
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Centro de Control de Descuentos de Nómina
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Monitoreo de ingestión de archivos, pipeline de procesamiento y distribución de resultados por
              cliente.
            </p>
          </div>

          <KpiSummary jobs={jobs} />

          <UploadPanel
            cliente={cliente}
            archivo={archivo}
            isSubmitting={isSubmitting}
            lastDispatchedJobId={lastDispatchedJobId}
            error={uploadError}
            onClienteChange={onClienteChange}
            onArchivoChange={onArchivoChange}
            onDespachar={onDespachar}
          />

          <section className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-lg items-start">
            <JobsTable
              jobs={jobs}
              onSelectJob={(jobId) => onSelectJob(jobId)}
              onReintentar={onReintentar}
              reintentandoId={reintentandoId}
            />
            <JobDrawer
              job={selectedJob}
              onClose={() => onSelectJob(null)}
              onReintentar={onReintentar}
              reintentando={reintentandoId === selectedJob?.id}
            />
          </section>

          <SystemStatusBar />
        </div>
      </main>
      <footer className="w-full bg-surface-container-lowest py-space-md shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
        <div className="w-full px-margin-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-body-xs text-body-xs">
          <span>Orquestador RPA LAD-6819</span>
          <span className="flex items-center gap-space-xs">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Gateway Conectado
          </span>
        </div>
      </footer>
    </div>
  );
}
