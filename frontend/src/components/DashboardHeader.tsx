import type { User } from "firebase/auth";

const NAV_ITEMS = [
  { path: "centro-de-control", label: "Centro de Control", disponible: true },
  { path: "lotes-y-auditoria", label: "Lotes & Auditoría", disponible: false },
  { path: "reglas-de-clientes", label: "Reglas de Clientes (YAML)", disponible: false },
  { path: "configuracion", label: "Configuración", disponible: false },
];

function iniciales(user: User): string {
  const fuente = user.displayName ?? user.email ?? "?";
  const partes = fuente.split(/[\s@.]+/).filter(Boolean);
  return partes.slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? "").join("") || "?";
}

export function DashboardHeader({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-margin-lg flex items-center justify-between gap-gutter-lg">
        <div className="flex items-center gap-space-md shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">RPA LAD-6819</span>
            <span className="font-body-xs text-body-xs text-on-surface-variant mt-space-xs">
              Descuentos de Nómina • Control Center
            </span>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-label-sm text-label-sm text-on-surface">Servicio RPA: En Línea</span>
            </div>
          </div>

          <nav className="flex items-center gap-space-xs bg-surface-container p-1 rounded-xl">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                aria-current={item.disponible ? "page" : undefined}
                title={item.disponible ? undefined : "Próximamente"}
                className={
                  item.disponible
                    ? "px-space-md py-1.5 transition-colors bg-primary-container text-on-primary font-semibold rounded-lg"
                    : "px-space-md py-1.5 rounded-lg text-on-surface-variant/50 font-label-md text-label-md cursor-default"
                }
                href="#"
                onClick={(event) => {
                  if (!item.disponible) event.preventDefault();
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          <span className="px-space-sm py-0.5 bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm rounded">
            PROD-CO
          </span>
          <button
            aria-label="Notificaciones"
            className="relative p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="h-6 w-px bg-outline-variant hidden sm:block" />
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-sm text-label-sm font-semibold">
              {iniciales(user)}
            </div>
            <div className="hidden lg:flex flex-col leading-tight text-left">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                {user.displayName ?? user.email}
              </span>
              <span className="font-body-xs text-body-xs text-on-surface-variant">Operaciones Nómina</span>
            </div>
            <button
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="p-1 text-on-surface-variant hover:text-error rounded transition-colors ml-space-xs"
              type="button"
              onClick={onSignOut}
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
