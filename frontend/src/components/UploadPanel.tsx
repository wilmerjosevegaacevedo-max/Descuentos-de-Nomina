import { useRef, useState } from "react";
import { CLIENTES, ClienteId } from "../types";
import { formatBytes } from "../utils/format";

type UploadPanelProps = {
  cliente: ClienteId;
  archivo: File | null;
  isSubmitting: boolean;
  lastDispatchedJobId: string | null;
  error: string;
  onClienteChange: (value: ClienteId) => void;
  onArchivoChange: (file: File | null) => void;
  onDespachar: () => void;
};

export function UploadPanel({
  cliente,
  archivo,
  isSubmitting,
  lastDispatchedJobId,
  error,
  onClienteChange,
  onArchivoChange,
  onDespachar,
}: UploadPanelProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onArchivoChange(file);
  }

  return (
    <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">cloud_upload</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Nuevo Lote / Despacho Manual</h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Selecciona el cliente corporativo y carga el archivo Excel/CSV para su procesamiento.
          </p>
        </div>
      </div>

      {/* Selector de cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {CLIENTES.map((option) => {
          const active = cliente === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onClienteChange(option.id)}
              className={`text-left p-space-md rounded-xl transition-all flex flex-col gap-space-sm relative ${
                active ? "bg-primary/5 shadow-[0_0_0_2px_#00288e]" : "bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-headline-sm text-headline-sm font-bold ${active ? "text-primary" : "text-on-surface"}`}>
                  {option.label}
                </span>
                {active ? (
                  <span className="px-space-sm py-0.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check</span> Seleccionado
                  </span>
                ) : (
                  <span className="px-space-sm py-0.5 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm rounded-full">
                    Esquema
                  </span>
                )}
              </div>
              <p className="font-body-xs text-body-xs text-on-surface-variant leading-relaxed">
                Formato validado según las reglas YAML configuradas para este cliente.
              </p>
            </button>
          );
        })}
      </div>

      {/* Zona de carga + previsualización */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`lg:col-span-7 p-space-lg rounded-xl flex flex-col items-center justify-center text-center gap-space-sm cursor-pointer transition-all ${
            isDraggingOver ? "bg-surface-container" : "bg-surface-container-low hover:bg-surface-container"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            className="hidden"
            onChange={(event) => onArchivoChange(event.target.files?.[0] ?? null)}
          />
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">upload_file</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface">
              Arrastra el archivo de nómina aquí o haz clic para explorar
            </span>
            <span className="font-body-xs text-body-xs text-on-surface-variant mt-0.5">
              Soporta formatos XLSX, XLS y CSV
            </span>
          </div>
          <div className="inline-flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[14px]">security</span>
            <span>Se sube cifrado a Firebase Storage</span>
          </div>
        </div>

        <div className="lg:col-span-5 p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between gap-space-md">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Archivo Seleccionado
              </span>
              {archivo && (
                <span className="px-space-sm py-0.5 bg-emerald-100 text-emerald-800 rounded font-code-sm text-code-sm flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Listo
                </span>
              )}
            </div>

            {archivo ? (
              <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest shadow-sm">
                <span className="material-symbols-outlined text-emerald-600 text-[28px]">description</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-on-surface truncate">{archivo.name}</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">{formatBytes(archivo.size)}</span>
                </div>
                <button
                  aria-label="Remover archivo"
                  className="text-on-surface-variant hover:text-error p-1 rounded transition-colors"
                  type="button"
                  onClick={() => onArchivoChange(null)}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ) : (
              <p className="font-body-xs text-body-xs text-on-surface-variant p-space-sm">
                Aún no has seleccionado ningún archivo.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-space-xs pt-space-xs">
            <button
              className="w-full inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
              disabled={!archivo || isSubmitting}
              onClick={onDespachar}
            >
              <span className={`material-symbols-outlined text-[18px] ${isSubmitting ? "animate-spin" : ""}`}>
                {isSubmitting ? "sync" : "send"}
              </span>
              <span>{isSubmitting ? "Despachando a FastAPI..." : "Subir y Despachar Lote"}</span>
            </button>
            {lastDispatchedJobId && !isSubmitting && !error && (
              <span className="font-body-xs text-body-xs text-emerald-700 text-center">
                Lote {lastDispatchedJobId} encolado correctamente.
              </span>
            )}
            {error && <span className="font-body-xs text-body-xs text-error text-center">{error}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
