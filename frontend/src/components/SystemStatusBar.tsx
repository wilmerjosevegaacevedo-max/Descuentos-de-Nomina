export function SystemStatusBar() {
  return (
    <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-lg">
      <div className="flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[24px]">dns</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface">Estado del Clúster de Deducción</span>
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            FastAPI Uvicorn · Firebase Auth/Firestore/Storage
          </span>
        </div>
      </div>
      <p className="font-body-xs text-body-xs text-on-surface-variant lg:max-w-sm lg:text-right">
        Conecta este panel a un endpoint de métricas del backend (CPU, memoria, colas) para reemplazar este
        placeholder por datos operativos en vivo.
      </p>
    </section>
  );
}
