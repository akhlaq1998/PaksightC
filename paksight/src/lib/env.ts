export {};

export const env = {
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  bootstrapToken: process.env.BOOTSTRAP_TOKEN || "dev-bootstrap-token",
  disableBootstrap: process.env.DISABLE_BOOTSTRAP === "true" ? true : false,
  ingestBootKey: process.env.INGEST_BOOT_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "PakSight <no-reply@paksight.app>",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 0),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  resendApiKey: process.env.RESEND_API_KEY || "",
  sendgridApiKey: process.env.SENDGRID_API_KEY || "",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
};

export function isEmailEnabled(): boolean {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass) || Boolean(env.resendApiKey || env.sendgridApiKey);
}