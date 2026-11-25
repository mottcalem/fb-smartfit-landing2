import nodemailer from "nodemailer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sendDealerApplication } from "@/lib/dealer-mail.server";
import { dealerSchema } from "@/lib/dealer";

vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn() },
}));

const application = dealerSchema.parse({
  storeName: "Test Mağazası",
  contactName: "Test Yetkilisi",
  phone: "05550000000",
  email: "applicant@example.test",
  city: "İstanbul",
  storeType: "Ayakkabı mağazası",
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("Bayi başvurusu e-postası", () => {
  it.each([465, 587])("SMTP %i portunda TLS kullanır ve başvuruyu iletir", async (port) => {
    vi.stubEnv("SMTP_HOST", "smtp.example.test");
    vi.stubEnv("SMTP_PORT", String(port));
    vi.stubEnv("SMTP_USER", "test");
    vi.stubEnv("SMTP_PASSWORD", "test");
    vi.stubEnv("SMTP_FROM", "sender@example.test");
    vi.stubEnv("DEALER_TO", "dealer@example.test");
    const sendMail = vi.fn().mockResolvedValue({});
    vi.mocked(nodemailer.createTransport).mockReturnValue(
      { sendMail } as unknown as ReturnType<typeof nodemailer.createTransport>,
    );

    await sendDealerApplication(application);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      port,
      secure: port === 465,
      requireTLS: port !== 465,
    }));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "dealer@example.test",
      replyTo: "applicant@example.test",
      text: expect.stringContaining("Mağaza adı: Test Mağazası"),
    }));
  });
});
