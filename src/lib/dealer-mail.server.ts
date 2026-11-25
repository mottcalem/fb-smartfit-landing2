import nodemailer from "nodemailer";
import type { DealerInput } from "./dealer";

export async function sendDealerApplication(data: DealerInput) {
  const { SMTP_HOST, SMTP_PORT = "587", SMTP_USER, SMTP_PASSWORD, SMTP_FROM, DEALER_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM || !DEALER_TO) {
    throw new Error("Incomplete dealer SMTP configuration");
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid dealer SMTP port");
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 15_000,
  });

  await transport.sendMail({
    from: SMTP_FROM,
    to: DEALER_TO,
    replyTo: data.email || undefined,
    subject: "SmartFit 2 · Yeni bayi başvurusu",
    text: [
      `Mağaza adı: ${data.storeName}`,
      `Yetkili: ${data.contactName}`,
      `Telefon: ${data.phone}`,
      `E-posta: ${data.email || "-"}`,
      `Şehir: ${data.city}`,
      `Mağaza tipi: ${data.storeType}`,
      `Not: ${data.message || "-"}`,
    ].join("\n"),
  });
}
