import { z } from "zod";

export const STORE_TYPES = ["Spor perakende", "Ayakkabı mağazası", "Outdoor / koşu mağazası", "Diğer"] as const;

export const dealerSchema = z.object({
  storeName: z.string().trim().min(2, "Mağaza adını yazın").max(120),
  contactName: z.string().trim().min(2, "Yetkili adını yazın").max(100),
  phone: z.string().trim().regex(/^[0-9+()\s-]{10,20}$/, "Geçerli bir telefon yazın"),
  email: z.union([z.literal(""), z.string().trim().email("Geçerli bir e-posta yazın").max(255)]),
  city: z.string().trim().min(2, "Şehri yazın").max(60),
  storeType: z.enum(STORE_TYPES),
  message: z.string().trim().max(1000).optional().default(""),
});
export type DealerInput = z.infer<typeof dealerSchema>;
