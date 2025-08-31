import nodemailer from "nodemailer";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { env, isEmailEnabled } from "@/lib/env";

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  const { to, subject, html } = options;

  if (!isEmailEnabled()) {
    await prisma.emailLog.create({ data: { to, subject, body: html } });
    return { logged: true };
  }

  if (env.resendApiKey) {
    const resend = new Resend(env.resendApiKey);
    await resend.emails.send({ from: env.emailFrom, to, subject, html });
    return { provider: "resend" };
  }

  if (env.smtp.host && env.smtp.user && env.smtp.pass) {
    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port || 587,
      secure: false,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
    await transporter.sendMail({ from: env.emailFrom, to, subject, html });
    return { provider: "smtp" };
  }

  // Fallback to EmailLog if other providers not configured
  await prisma.emailLog.create({ data: { to, subject, body: html } });
  return { logged: true };
}