// Product catalogue, store config and recommendation logic for the SmartFit landing.

import { appendCheckoutAttribution, trackLandingStep } from "./smartfit-tracking";

export type ModelId = "konfor" | "energy" | "destek";
export type SizeId = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export const PRICE_TL = 4900; // KDV dahil, tüm modeller
export const VAT_RATE = 0.1;

export const formatTL = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

export interface Model {
  id: ModelId;
  name: string;
  short: string;
  slogan: string;
  description: string;
  audience: string[];
  /** Feature highlights from the official SmartFit product documentation (pages 9–11). */
  features: { title: string; desc: string }[];
  support: 1 | 2 | 3;
  cushion: 1 | 2 | 3;
  usage: string;
  upper: string;
  cushionLayer: string;
  supportStructure: string;
  extra?: string[];
}

export const MODELS: Model[] = [
  {
    id: "konfor",
    name: "SmartFit Konfor",
    short: "Konfor",
    slogan: "Gün boyu konfor.",
    description:
      "Üstün yastıklama, esnek ayak kavis desteği ve destekleyici topuk yapısıyla günlük kullanım için tasarlandı.",
    audience: ["Uzun süre ayakta kalanlar", "Günlük yürüyüş yapanlar", "Yumuşak konfor tercih edenler"],
    features: [
      { title: "Üstten alta yastıklama", desc: "Ayağınızı yerleştirdiğiniz ilk andan itibaren son derece yumuşak bir konfor sunar." },
      { title: "Esnek ve uyum sağlayan ayak kavis desteği", desc: "Ayağın doğal hareketlerine uyum sağlar." },
      { title: "Güçlendirilmiş topuk yastıklaması", desc: "Uzun süre ayakta kalırken veya hareket hâlindeyken darbe etkisini ve yorgunluğu azaltır." },
      { title: "Basıncı hafifleten tasarım", desc: "Ayak tabanındaki yüklenmeyi azaltır; hassas ayaklar ve maksimum konfor arayanlar için idealdir." },
    ],
    support: 1,
    cushion: 3,
    usage: "Günlük konfor",
    upper: "Polyester tekstil",
    cushionLayer: "PU foam 3 mm",
    supportStructure: "EVA, TPU spine",
  },
  {
    id: "energy",
    name: "SmartFit Energy",
    short: "Energy",
    slogan: "Hareketine enerji kat.",
    description:
      "Dinamik yastıklama, dengeli ayak kavis desteği ve kontrollü orta ayak yapısıyla aktif yaşam için geliştirildi.",
    audience: ["Koşu ve yürüyüş yapanlar", "Fitness ve aktif spor kullanıcıları", "Hareketli yaşam tarzına sahip olanlar"],
    features: [
      { title: "Tepki veren yastıklama", desc: "Darbeleri emer ve enerjiyi geri vererek daha dinamik, ileri itişi destekleyen adımlar sağlar." },
      { title: "Kontrollü, dinamik ayak kavsi desteği", desc: "Doğal harekete izin verirken ayağın doğru hizalanmasını destekler." },
      { title: "Daha sıkı orta ayak yapısı", desc: "Tempolu aktivitelerde ve yön değişikliklerinde dengeyi ve güç aktarımını artırır." },
    ],
    support: 2,
    cushion: 2,
    usage: "Spor ve aktif yaşam",
    upper: "Polyester tekstil",
    cushionLayer: "TPE foam 2 mm",
    supportStructure: "EVA, TPU spine",
  },
  {
    id: "destek",
    name: "SmartFit Destek",
    short: "Destek",
    slogan: "Daha güçlü destek. Daha dengeli adımlar.",
    description:
      "Güçlü ayak kavis destek yapısı ve stabilite odaklı tasarımıyla daha belirgin destek isteyenler için geliştirildi.",
    audience: [
      "Güçlü ayak kavsi desteği arayanlar",
      "Daha stabil bir kullanım hissi tercih edenler",
      "Günlük hareketlerinde daha belirgin destek isteyenler",
    ],
    features: [
      { title: "Ayak kavis yapısı", desc: "Hareketi kontrol etmeye ve yorgunluğu azaltmaya yardımcı olur." },
      { title: "Dinamik iç ayak kavis desteği", desc: "Doğal harekete izin verirken güçlü biyomekanik destek sağlar." },
      { title: "İlave topuk yastıklaması", desc: "Ayağın arka bölümündeki yüklenmeyi azaltır." },
    ],
    support: 3,
    cushion: 1,
    usage: "Daha güçlü destek",
    upper: "Polyester tekstil",
    cushionLayer: "PU foam 3 mm",
    supportStructure: "EVA ve güçlendirilmiş spine",
    extra: ["Nylon / glass fiber spine", "İlave PU topuk destek parçası"],
  },
];

export const getModel = (id: ModelId) => MODELS.find((m) => m.id === id)!;

export const SIZES: { id: SizeId; range: string }[] = [
  { id: "XS", range: "36–37" },
  { id: "S", range: "38–39" },
  { id: "M", range: "40–41" },
  { id: "L", range: "42–43" },
  { id: "XL", range: "44–45" },
  { id: "XXL", range: "46–47" },
];

const shopifyVariants = {
  comfort: {
    XS: "68251290534184", S: "68251290566952", M: "68251290599720",
    L: "68251290632488", XL: "68251290665256", XXL: "68251290698024",
  },
  energy: {
    XS: "68251415839016", S: "68251415871784", M: "68251415904552",
    L: "68251415937320", XL: "68251415970088", XXL: "68251416002856",
  },
  support: {
    XS: "68251427111208", S: "68251427143976", M: "68251427176744",
    L: "68251427209512", XL: "68251427242280", XXL: "68251427275048",
  },
} satisfies Record<"comfort" | "energy" | "support", Record<SizeId, string>>;

const shopifyModels = {
  konfor: "comfort",
  energy: "energy",
  destek: "support",
} as const satisfies Record<ModelId, keyof typeof shopifyVariants>;

function variantId(model: ModelId, size: SizeId) {
  return shopifyVariants[shopifyModels[model]]?.[size];
}

export const hasVariant = (model: ModelId, size: SizeId) => typeof variantId(model, size) === "string";

export type CartLine = { model: ModelId; size: SizeId; quantity: number };

export function shopifyCartUrl(cart: readonly CartLine[]) {
  if (cart.length === 0) return null;
  const variants = cart.map(({ model, size, quantity }) => {
    const id = variantId(model, size);
    return typeof id === "string" && Number.isSafeInteger(quantity) && quantity > 0
      ? `${id}:${quantity}`
      : null;
  });
  if (variants.includes(null)) return null;
  const query = new URLSearchParams({ storefront: "true" });
  appendCheckoutAttribution(query);
  return `https://shop.footbalance.com.tr/cart/${variants.join(",")}?${query}`;
}

export type Purpose = "daily" | "active" | "support";
export type Feel = "soft" | "balanced" | "firm";

const PURPOSE_MODEL: Record<Purpose, ModelId> = { daily: "konfor", active: "energy", support: "destek" };
const FEEL_MODEL: Record<Feel, ModelId> = { soft: "konfor", balanced: "energy", firm: "destek" };

/** One model when answers agree; two models (purpose first) when they conflict. Firm feel always includes Destek. */
export function recommend(purpose: Purpose, feel: Feel): ModelId[] {
  const a = PURPOSE_MODEL[purpose];
  const b = FEEL_MODEL[feel];
  return a === b ? [a] : [a, b];
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  trackLandingStep(event, params);
}
export const gaItem = (m: ModelId, size?: SizeId) => ({
  item_id: (size && variantId(m, size)) || `smartfit-${m}`,
  item_name: getModel(m).name,
  item_brand: "FootBalance",
  item_variant: size,
  price: PRICE_TL,
  quantity: 1,
});
