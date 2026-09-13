import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, User } from "firebase/auth";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { auth, db, firebaseConfigured, storage } from "./firebase";
import { ClienteId, Job } from "./types";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const REMEMBER_EMAIL_KEY = "rpa-lad-6819:lastEmail";

export default function App() {
  // Autenticación
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  // Datos y despacho de lotes
  const [cliente, setCliente] = useState<ClienteId>("cdf");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [lastDispatchedJobId, setLastDispatchedJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [reintentandoId, setReintentandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberDevice(true);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setJobs([]);
      return;
    }
    if (!db) return;
    const jobsQuery = query(
      collection(db, "jobs"),
      where("usuarioId", "==", user.uid),
      orderBy("creadoEn", "desc"),
    );
    return onSnapshot(jobsQuery, (snapshot) => {
      setJobs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job)));
    });
  }, [user]);

  const [modoDemo, setModoDemo] = useState(false);

  async function iniciarSesion(event: React.FormEvent) {
    event.preventDefault();
    setAuthError("");
    setIsSigningIn(true);
    try {
      if (modoDemo || !auth) {
        setUser({ uid: "demo-operador-01", email: email || "operador.rpa@blacksmith.com" } as User);
        setJobs([
          {
            id: "LOTE-2026-CDF-001",
            cliente: "cdf",
            nombreArchivo: "Nomina_CDF_Septiembre_2026.xlsx",
            estado: "EXITOSO",
            archivoSalida: "jobs/demo/salida.zip",
            tamanoBytes: 245760,
            creadoEn: { toDate: () => new Date(Date.now() - 1000 * 60 * 12) } as any,
          },
          {
            id: "LOTE-2026-CONTI-002",
            cliente: "continental",
            nombreArchivo: "Nomina_Continental_Q1.xlsx",
            estado: "PROCESANDO",
            tamanoBytes: 512000,
            creadoEn: { toDate: () => new Date(Date.now() - 1000 * 60 * 3) } as any,
          },
          {
            id: "LOTE-2026-DXC-003",
            cliente: "dxc",
            nombreArchivo: "DXC_Reporte_Descuentos.xlsx",
            estado: "FALLIDO",
            error: "Falta columna obligatoria: 'Employees Number ID (ATTUID)'.",
            tamanoBytes: 128000,
            creadoEn: { toDate: () => new Date(Date.now() - 1000 * 60 * 95) } as any,
          },
        ]);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberDevice) {
        window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {
      setAuthError("No fue posible iniciar sesión.");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function despacharLote() {
    if (!user || !archivo) return;
    setUploadError("");
    setIsSubmitting(true);
    setLastDispatchedJobId(null);
    try {
      if (modoDemo || !db || !storage) {
        const demoId = `LOTE-${Date.now().toString().slice(-4)}`;
        const nuevoJob: Job = {
          id: demoId,
          cliente,
          nombreArchivo: archivo.name,
          tamanoBytes: archivo.size,
          estado: "PROCESANDO",
          creadoEn: { toDate: () => new Date() } as any,
        };
        setJobs((prev) => [nuevoJob, ...prev]);
        setLastDispatchedJobId(demoId);
        setArchivo(null);
        setTimeout(() => {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === demoId
                ? { ...j, estado: "EXITOSO", archivoSalida: "jobs/demo/salida.zip" }
                : j
            )
          );
        }, 3500);
        return;
      }
      const jobDocRef = doc(collection(db, "jobs"));
      const storagePath = `jobs/${user.uid}/${jobDocRef.id}/entrada/${archivo.name}`;
      const inputRef = ref(storage, storagePath);
      await uploadBytes(inputRef, archivo);
      await setDoc(jobDocRef, {
        cliente,
        usuarioId: user.uid,
        nombreArchivo: archivo.name,
        archivoEntrada: storagePath,
        tamanoBytes: archivo.size,
        estado: "PENDIENTE",
        creadoEn: serverTimestamp(),
      });
      const token = await user.getIdToken();
      await fetch(`${apiUrl}/jobs/${jobDocRef.id}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setArchivo(null);
      setLastDispatchedJobId(jobDocRef.id);
    } catch {
      setUploadError("No fue posible crear el trabajo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reintentarLote(jobId: string) {
    if (!user) return;
    setReintentandoId(jobId);
    try {
      if (modoDemo) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, estado: "PROCESANDO", error: undefined } : j))
        );
        setTimeout(() => {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === jobId
                ? { ...j, estado: "EXITOSO", archivoSalida: "jobs/demo/salida.zip" }
                : j
            )
          );
          setReintentandoId(null);
        }, 2500);
        return;
      }
      const token = await user.getIdToken();
      await fetch(`${apiUrl}/jobs/${jobId}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // El estado de error del lote lo refleja Firestore vía onSnapshot.
    } finally {
      if (!modoDemo) setReintentandoId(null);
    }
  }

  if (!firebaseConfigured && !modoDemo) {
    return (
      <main className="w-full min-h-screen bg-background flex items-center justify-center p-6">
        <section className="w-full max-w-2xl rounded-xl bg-surface-container-lowest p-8 shadow-xl border border-surface-container">
          <div className="flex items-center gap-2 text-primary font-code-sm text-code-sm uppercase tracking-wider font-semibold">
            <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
            Configuración del Sistema
          </div>
          <h1 className="mt-3 font-headline-lg text-headline-lg text-on-surface">Panel de Control RPA LAD-6819</h1>
          <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
            Para conectar con la base de datos y autenticación en la nube, completa las variables de Firebase en <strong>frontend/.env</strong>.
          </p>
          <pre className="mt-4 overflow-auto rounded-lg bg-surface-container p-4 text-xs font-mono text-on-surface">{`VITE_API_URL=http://localhost:8000\nVITE_FIREBASE_API_KEY=...\nVITE_FIREBASE_AUTH_DOMAIN=...\nVITE_FIREBASE_PROJECT_ID=...\nVITE_FIREBASE_STORAGE_BUCKET=...\nVITE_FIREBASE_APP_ID=...`}</pre>
          <div className="mt-6 pt-5 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-body-xs text-on-surface-variant">
              ¿Deseas previsualizar la interfaz y probar el flujo de control?
            </span>
            <button
              type="button"
              onClick={() => setModoDemo(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Explorar Panel Web (Modo Demo)
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        email={email}
        password={password}
        showPassword={showPassword}
        rememberDevice={rememberDevice}
        isSigningIn={isSigningIn}
        cliente={cliente}
        error={authError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onToggleShowPassword={() => setShowPassword((value) => !value)}
        onRememberDeviceChange={setRememberDevice}
        onClienteChange={setCliente}
        onSubmit={iniciarSesion}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      jobs={jobs}
      cliente={cliente}
      onClienteChange={setCliente}
      archivo={archivo}
      onArchivoChange={setArchivo}
      isSubmitting={isSubmitting}
      lastDispatchedJobId={lastDispatchedJobId}
      uploadError={uploadError}
      onDespachar={despacharLote}
      selectedJobId={selectedJobId}
      onSelectJob={setSelectedJobId}
      onReintentar={reintentarLote}
      reintentandoId={reintentandoId}
      onSignOut={() => {
        auth?.signOut();
        setUser(null);
      }}
    />
  );
}
