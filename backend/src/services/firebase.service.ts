import fs from "node:fs";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getRPAConfig } from "../config";

let firestoreInstance: Firestore | null = null;
let storageBucketInstance: any = null;

export function inicializarFirebase(): {
  db: Firestore | null;
  bucket: any;
} {
  if (firestoreInstance) {
    return { db: firestoreInstance, bucket: storageBucketInstance };
  }

  const config = getRPAConfig();
  const keyPath = config.firebaseKeyPath;

  if (getApps().length === 0 && fs.existsSync(keyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: bucketName,
      });

      firestoreInstance = getFirestore();
      if (bucketName) {
        storageBucketInstance = getStorage().bucket();
      }
      console.log("[FirebaseService] Conexión a Firebase inicializada.");
    } catch (error) {
      console.warn("[FirebaseService] Advertencia al inicializar Firebase:", error);
    }
  } else if (getApps().length > 0) {
    firestoreInstance = getFirestore();
    try {
      storageBucketInstance = getStorage().bucket();
    } catch {
      // sin bucket
    }
  }

  return { db: firestoreInstance, bucket: storageBucketInstance };
}

export async function registrarJobEnFirestore(
  jobId: string,
  cliente: string,
  estado: "EXITOSO" | "FALLIDO" | "IGNORADO",
  error = "",
  batchId = ""
): Promise<void> {
  const { db } = inicializarFirebase();
  if (!db) return;

  try {
    const docRef = db.collection("jobs").doc(jobId);
    await docRef.set({
      cliente,
      estado,
      nombreArchivo: `Lote_Correo_${jobId.slice(0, 8)}`,
      batchId,
      error,
      usuarioId: "7bpFEXmiBRUkXcuvEzSaajR8hIg2",
      creadoEn: FieldValue.serverTimestamp(),
      actualizadoEn: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("[FirebaseService] Error guardando registro en Firestore:", err);
  }
}

