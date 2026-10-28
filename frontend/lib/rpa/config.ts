import path from "node:path";

export interface RPAConfig {
  filesBasePath: string;
  adminEmail: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
  };
  mailbox: {
    host: string;
    port: number;
    user: string;
    pass: string;
    folder: string;
    processedFolder: string;
    errorFolder: string;
  };
  firebaseKeyPath: string;
}

export function getRPAConfig(): RPAConfig {
  const cwd = process.cwd();
  const rawBasePath = process.env.FILES_BASE_PATH;
  const resolvedBasePath = rawBasePath
    ? path.isAbsolute(rawBasePath)
      ? rawBasePath
      : path.join(/*turbopackIgnore: true*/ cwd, rawBasePath)
    : path.join(/*turbopackIgnore: true*/ cwd, "files");

  const rawKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  const resolvedFirebaseKeyPath = rawKeyPath
    ? path.isAbsolute(rawKeyPath)
      ? rawKeyPath
      : path.join(/*turbopackIgnore: true*/ cwd, rawKeyPath)
    : path.join(/*turbopackIgnore: true*/ cwd, "firebase-key.json");

  return {
    filesBasePath: resolvedBasePath,
    adminEmail: process.env.ADMIN_EMAIL || "rpalad6819@gmail.com",
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
      user: process.env.SMTP_USER || "rpalad6819@gmail.com",
      pass: process.env.SMTP_PASSWORD || "",
      secure: process.env.SMTP_USE_TLS === "false", // false = STARTTLS en 587
    },
    mailbox: {
      host: process.env.MAILBOX_HOST || "imap.gmail.com",
      port: Number.parseInt(process.env.MAILBOX_PORT || "993", 10),
      user: process.env.MAILBOX_USER || "rpalad6819@gmail.com",
      pass: process.env.MAILBOX_PASSWORD || "",
      folder: process.env.MAILBOX_FOLDER || "INBOX",
      processedFolder: process.env.MAILBOX_PROCESSED_FOLDER || "Procesados",
      errorFolder: process.env.MAILBOX_ERROR_FOLDER || "Errores",
    },
    firebaseKeyPath: resolvedFirebaseKeyPath,
  };
}

