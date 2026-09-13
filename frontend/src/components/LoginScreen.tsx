import { CLIENTES, ClienteId } from "../types";

type LoginScreenProps = {
  email: string;
  password: string;
  showPassword: boolean;
  rememberDevice: boolean;
  isSigningIn: boolean;
  cliente: ClienteId;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onRememberDeviceChange: (value: boolean) => void;
  onClienteChange: (value: ClienteId) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function LoginScreen({
  email,
  password,
  showPassword,
  rememberDevice,
  isSigningIn,
  cliente,
  error,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
  onRememberDeviceChange,
  onClienteChange,
  onSubmit,
}: LoginScreenProps) {
  return (
    <main className="w-full min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col w-full items-center justify-center p-gutter-lg md:p-margin-lg relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-xl shadow-xl overflow-hidden bg-surface-container-lowest">
          {/* Panel izquierdo: identidad y telemetría */}
          <div className="lg:col-span-5 bg-primary text-on-primary p-space-xl md:p-margin-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex flex-col gap-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="p-space-xs bg-surface-container-lowest/10 rounded-lg flex items-center justify-center backdrop-blur-sm w-14 h-14">
                  <span className="material-symbols-outlined text-[28px]">receipt_long</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-code-sm text-code-sm text-tertiary-fixed tracking-wider uppercase">
                    LAD-6819 Engine
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-primary font-bold">
                    Orquestador Nómina
                  </span>
                </div>
              </div>

              <div className="mt-space-sm flex flex-col gap-space-xs">
                <h2 className="font-headline-lg text-headline-lg text-on-primary leading-tight">
                  Automatización de Descuentos de Nómina
                </h2>
                <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-relaxed">
                  Plataforma centralizada de orquestación robótica, conciliación en tiempo real y dispersión
                  transaccional segura para empresas aliadas.
                </p>
              </div>

              <div className="flex flex-wrap gap-space-xs pt-space-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/10 backdrop-blur-md text-tertiary-fixed font-code-sm text-code-sm">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                  <span>TLS 1.3 End-to-End</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/10 backdrop-blur-md text-tertiary-fixed font-code-sm text-code-sm">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  <span>Firebase Auth • FastAPI</span>
                </div>
              </div>

              <div className="flex flex-col gap-space-sm mt-space-md bg-surface-container-lowest/5 backdrop-blur-md p-space-md rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider">
                    Estado del Entorno RPA
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-code-sm text-code-sm text-tertiary-fixed-dim">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sincronizado
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-space-xs pt-space-xs">
                  <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest/5 rounded">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">dns</span>
                      <span className="font-body-xs text-body-xs text-on-primary">API Gateway</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-emerald-300 font-semibold">99.98% (Online)</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest/5 rounded">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">smart_toy</span>
                      <span className="font-body-xs text-body-xs text-on-primary">Workers Nómina</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-on-primary">4 Nodos Activos</span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs bg-surface-container-lowest/5 rounded">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">mail</span>
                      <span className="font-body-xs text-body-xs text-on-primary">Buzón Exchange</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-emerald-300 font-semibold">Conectado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-space-xl flex items-center justify-between text-primary-fixed-dim font-code-sm text-code-sm">
              <span>RUN-HASH: #8F9A-LAD</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                V3.4.1 Production
              </span>
            </div>
          </div>

          {/* Panel derecho: formulario de autenticación */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl md:p-margin-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-sm text-code-sm font-semibold uppercase">
                    Autenticación Segura
                  </span>
                  <span className="text-on-surface-variant font-code-sm text-code-sm">• Portal LAD-6819</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Iniciar Sesión en el Orquestador</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Acceso seguro para analistas de compensación y supervisores de nómina autorizados.
                </p>
              </div>

              <div className="mt-space-lg flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Unidad Corporativa / Cliente
                </label>
                <div className="grid grid-cols-3 gap-space-sm">
                  {CLIENTES.map((option) => {
                    const active = cliente === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onClienteChange(option.id)}
                        className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-center transition-all ${
                          active
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="font-label-md text-label-md">{option.label}</span>
                        {active && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form className="mt-space-lg flex flex-col gap-space-md" onSubmit={onSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                    htmlFor="email-input"
                  >
                    <span>Correo Institucional</span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">SSO Corporativo</span>
                  </label>
                  <div className="relative flex items-center rounded-lg bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                      alternate_email
                    </span>
                    <input
                      id="email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="operador.nomina@empresa.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="password-input">
                      Contraseña de Acceso
                    </label>
                  </div>
                  <div className="relative flex items-center rounded-lg bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                      key
                    </span>
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => onPasswordChange(event.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline outline-none"
                    />
                    <button
                      type="button"
                      title="Mostrar/ocultar contraseña"
                      onClick={onToggleShowPassword}
                      className="absolute right-3 text-on-surface-variant hover:text-on-surface focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-space-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(event) => onRememberDeviceChange(event.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container-high accent-primary text-primary focus:ring-0 cursor-pointer"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant select-none">
                      Recordar estación de trabajo segura
                    </span>
                  </label>
                  <div className="flex items-center gap-1 font-code-sm text-code-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>FastAPI Token Ready</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="mt-space-sm w-full py-3 px-space-lg rounded-lg bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isSigningIn ? "animate-spin" : ""}`}>
                    {isSigningIn ? "sync" : "lock_open"}
                  </span>
                  <span>{isSigningIn ? "Verificando Credenciales..." : "Acceder al Centro de Control"}</span>
                </button>

                {error && <p className="text-error font-body-sm text-body-sm">{error}</p>}
              </form>
            </div>

            <div className="mt-space-xl p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Registro de Auditoría Centralizado
                </span>
                <p className="font-body-xs text-body-xs text-on-surface-variant">
                  Acceso restringido únicamente a personal autorizado. Toda transacción, ingreso o intento fallido
                  queda registrado formalmente en la bitácora de auditoría inmutable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
