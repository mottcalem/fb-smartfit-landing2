import { createServerFn } from "@tanstack/react-start";
import { dealerSchema } from "./dealer";
import { sendDealerApplication } from "./dealer-mail.server";

export const submitDealerApplication = createServerFn({ method: "POST" })
  .validator((input: unknown) => dealerSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      await sendDealerApplication(data);
    } catch {
      console.error("Dealer application SMTP delivery failed");
      throw new Error("Başvurunuz gönderilemedi. Lütfen tekrar deneyin.");
    }
    return { ok: true };
  });
