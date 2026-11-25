import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, Check, ChevronLeft, Instagram, Mail, MapPin, MessageCircle, Phone, Quote, ShoppingBag, Star, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  MODELS, PRICE_TL, SIZES, formatTL, gaItem, getModel, hasVariant, recommend, shopifyCartUrl, track,
  type CartLine, type Feel, type ModelId, type Purpose, type SizeId,
} from "@/lib/smartfit";
import { Dots, FamilyVisual, MODEL_IMAGE, ProductVisual, Reveal, SectionHead, modelTone } from "@/components/smartfit/ui";
import { DailyBenefits, InsoleDifference, PurchaseAssurance, TrialAssurance, UsageGuide } from "@/components/smartfit/confidence";
import { CLEANING_TEXT, DISPATCH_TEXT, RETURN_TEXT } from "@/lib/smartfit-policies";
import { captureAttribution, trackEcommerce } from "@/lib/smartfit-tracking";
import { CONTACT, hasContact, igHref, mailHref, telHref, waHref } from "@/lib/smartfit-contact";
import { DealerDialog } from "@/components/smartfit/dealer-dialog";
import { Videos } from "@/components/smartfit/videos";
import layerStackImg from "@/assets/smartfit-layer-stack-cut.webp";
import layer1Img from "@/assets/smartfit-layer-1-textile.png";
import layer2Img from "@/assets/smartfit-layer-2-cushion.png";
import layer3Img from "@/assets/smartfit-layer-3-foam.png";
import layer4Img from "@/assets/smartfit-layer-4-spine.png";

const TITLE = "FootBalance SmartFit | Konfor, Energy ve Destek Tabanlıklar";
const DESC =
  "FootBalance SmartFit hazır tabanlıkları keşfedin. Günlük konfor, aktif yaşam ve daha güçlü destek için üç farklı model. KDV dahil 4.900 TL.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": MODELS.map((m) => ({
            "@type": "Product",
            name: `FootBalance ${m.name}`,
            brand: { "@type": "Brand", name: "FootBalance" },
            description: m.description,
            offers: { "@type": "Offer", price: PRICE_TL, priceCurrency: "TRY" },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

/**
 * Real Google reviews only — never invent entries here.
 * Add each verified review below (author, rating, text); the section stays hidden while empty
 * and only shows ratings of 4 stars and above.
 */
type Review = { model: ModelId; text: string; author: string; rating: 1 | 2 | 3 | 4 | 5; date?: string };
const REVIEWS: Review[] = [];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Landing() {
  const [model, setModel] = useState<ModelId | null>(null);
  const [size, setSize] = useState<SizeId | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [dealerOpen, setDealerOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const focusReturn = useRef<HTMLElement | null>(null);
  const trackedLanding = useRef(false);

  const rememberTrigger = () => {
    focusReturn.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  };

  const restoreFocus = (event: Event) => {
    event.preventDefault();
    // Wait for the sheet that received the handoff to finish mounting.
    if (!buyOpen && !cartOpen) focusReturn.current?.focus();
  };

  useEffect(() => {
    if (!trackedLanding.current) {
      trackedLanding.current = true;
      captureAttribution();
      track("page_view_landing", { page: "smartfit" });
      trackEcommerce("view_item", MODELS.map((item) => gaItem(item.id)));
    }
    const onScroll = () => {
      const closing = document.getElementById("kapanis")?.getBoundingClientRect();
      const nearEnd = closing ? closing.top < window.innerHeight : false;
      setShowSticky(window.scrollY > 700 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pickSize = (s: SizeId) => {
    setSize(s);
    track("select_size", { size: s, model });
  };

  const addToCart = (m: ModelId, s: SizeId) => {
    if (!hasVariant(m, s)) return;
    setCart((c) => {
      const ex = c.find((i) => i.model === m && i.size === s);
      return ex ? c.map((i) => (i === ex ? { ...i, quantity: i.quantity + 1 } : i)) : [...c, { model: m, size: s, quantity: 1 }];
    });
    trackEcommerce("add_to_cart", [gaItem(m, s)]);
    setCartMessage(`${getModel(m).name} ${s} sepete eklendi.`);
    setBuyOpen(false);
    setCartOpen(true);
  };

  const openBuy = (selectedModel: ModelId = model ?? "konfor") => {
    if (!cartOpen) rememberTrigger();
    setModel(selectedModel);
    trackEcommerce("view_item", [gaItem(selectedModel)]);
    setSize(null);
    setCartOpen(false);
    setBuyOpen(true);
  };

  const removeLine = ({ model, size }: CartLine) => {
    setCart((lines) => lines.filter((line) => line.model !== model || line.size !== size));
    setCartMessage(`${getModel(model).name} ${size} sepetten kaldırıldı.`);
  };

  const cartCount = cart.reduce((count, line) => count + line.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header cartCount={cartCount} onCart={() => { rememberTrigger(); setCartMessage(""); setCartOpen(true); }} onDealer={() => setDealerOpen(true)} />
      <main>
        <Hero />
        <DailyBenefits />
        <Models selected={model} onPick={(id) => { track("select_item", { ecommerce: { items: [gaItem(id)] } }); openBuy(id); }} />
        <Wizard onModel={setModel} onAdd={(m, s, trigger) => {
          focusReturn.current = trigger;
          addToCart(m, s);
        }} />
        <InsoleDifference />
        <WhySmartFit />
        <UsageGuide />
        <Videos />
        <TrialAssurance />
        <Reviews />
        <Faq />
        <ReviewsBanner />
        <Closing onCta={() => scrollTo("modeller")} />
      </main>
      <Footer />
      <DealerDialog open={dealerOpen} onOpenChange={setDealerOpen} />

      {/* Mobile sticky purchase bar */}
      <div
        inert={!showSticky || buyOpen || cartOpen}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur transition-transform md:hidden",
          showSticky && !buyOpen && !cartOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-navy">{model ? getModel(model).name : "SmartFit"}{size ? ` · ${size}` : ""}</p>
            <p className="text-xs text-muted-foreground">{formatTL(PRICE_TL)} · KDV dahil</p>
          </div>
          <Button size="lg" className="h-12 px-6 font-bold" onClick={() => openBuy()}>Satın Al</Button>
        </div>
      </div>

      <BuySheet
        open={buyOpen}
        onOpenChange={setBuyOpen}
        model={model}
        size={size}
        onCloseAutoFocus={restoreFocus}
        onModel={setModel}
        onSize={pickSize}
        onAdd={addToCart}
      />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCloseAutoFocus={restoreFocus}
        cart={cart}
        message={cartMessage}
        onRemove={removeLine}
      />
    </div>
  );
}

/* ---------------- Header ---------------- */
function Header({ cartCount, onCart, onDealer }: { cartCount: number; onCart: () => void; onDealer: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5">
        <a href="#" className="text-lg font-extrabold tracking-tight text-navy">
          FootBalance<span className="text-primary">.</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
          <button onClick={() => scrollTo("modeller")} className="hover:text-navy">Modeller</button>
          <button onClick={() => scrollTo("bulucu")} className="hover:text-navy">Model Bulucu</button>
          <button onClick={() => scrollTo("teknoloji")} className="hover:text-navy">Teknoloji</button>
          <button onClick={() => scrollTo("videolar")} className="hover:text-navy">Videolar</button>
          <button onClick={() => scrollTo("sss")} className="hover:text-navy">SSS</button>
        </nav>
        <div className="flex items-center gap-2">
        <button onClick={onDealer} className="rounded-full border border-navy/20 px-4 py-2 text-sm font-bold text-navy hover:border-primary hover:text-primary">Bayi Olun</button>
        <button onClick={onCart} className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted" aria-label={`Sepet, ${cartCount} ürün`}>
          <ShoppingBag className="h-5 w-5 text-navy" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{cartCount}</span>
          )}
        </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- 1. Hero ---------------- */
function Hero() {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-[1240px] items-center gap-6 px-5 pt-10 pb-12 md:grid-cols-2 md:gap-12 md:pt-20 md:pb-20">
        <div className="md:col-start-1 md:row-start-1 md:self-end">
          <p className="mb-4 text-xs font-bold tracking-[0.25em] text-primary">FİNLANDİYA MÜHENDİSLİĞİ</p>
          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-navy md:text-6xl">
            Ayakkabını değil, tabanlığını değiştir.
          </h1>
        </div>
        <div className="relative aspect-[4/3] md:col-start-2 md:row-span-2 md:row-start-1 md:aspect-square">
          <FamilyVisual priority />
        </div>
        <div className="md:col-start-1 md:row-start-2 md:self-start">
          <p className="max-w-lg text-base text-muted-foreground md:text-lg">
            10 milyondan fazla ayak analiziyle geliştirilen akıllı destek. İster yoğun ayakta kal, ister hareket et; gün boyu tabanındaki konforu, enerjiyi, desteği hisset.
          </p>
          <div className="mt-6">
            <p className="text-4xl font-extrabold text-navy">{PRICE_TL.toLocaleString("tr-TR")} <span className="text-xl font-bold">TL</span></p>
            <p className="mt-1 text-sm text-muted-foreground">KDV dahil • Tüm modeller</p>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-7 text-base font-bold" onClick={() => { track("hero_cta_click", { cta: "finder" }); scrollTo("bulucu"); }}>
              Bana Uygun SmartFit'i Bul
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-navy px-7 text-base font-bold text-navy" onClick={() => { track("hero_cta_click", { cta: "models" }); scrollTo("modeller"); }}>
              Üç Modeli Keşfet
            </Button>
          </div>
          <div className="mt-5"><PurchaseAssurance /></div>
        </div>
      </div>
      <div className="border-t bg-background">
        <ul className="mx-auto grid max-w-[1240px] grid-cols-1 gap-3 px-5 py-5 text-sm font-semibold text-navy sm:grid-cols-3">
          {["3 farklı destek seçeneği", "Kullanıma hazır tasarım", "Finlandiya  mühendisliği"].map((t) => (
            <li key={t} className="flex items-center gap-2 sm:justify-center">
              <Check className="h-4 w-4 text-primary" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 2. Models ---------------- */
function Models({ selected, onPick }: { selected: ModelId | null; onPick: (id: ModelId) => void }) {
  return (
    <section id="modeller" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-5">
        <Reveal><SectionHead title="Hangi SmartFit senin için?" sub="Her ayak ve her yaşam tarzı aynı desteğe ihtiyaç duymaz. Sana uygun modeli keşfet." /></Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {MODELS.map((m) => (
            <Reveal key={m.id}>
              <article
                aria-labelledby={`model-${m.id}-title`}
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  selected === m.id && "ring-2 ring-primary",
                )}
              >
                <div className={cn("aspect-[4/3] p-6", modelTone[m.id].soft)}>
                  <ProductVisual model={m} className="transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 id={`model-${m.id}-title`} className="text-2xl font-extrabold text-navy">{m.name}</h3>
                  <p className="mt-1 font-semibold text-navy/80">{m.slogan}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {m.audience.map((a) => (
                      <li key={a} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{a}</li>
                    ))}
                  </ul>
                  <div className="mt-5 space-y-2 border-t pt-4">
                    <Dots label="Destek" value={m.support} model={m.id} />
                    <Dots label="Yastıklama" value={m.cushion} model={m.id} />
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="text-xl font-extrabold text-navy">{formatTL(PRICE_TL)}</span>
                    <Button className="h-12 px-5 font-bold" onClick={() => onPick(m.id)}>Numaranı Seç</Button>
                  </div>
                  <div className="mt-4 border-t pt-4"><PurchaseAssurance showOffers /></div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Size picker ---------------- */
function SizePicker({ size, onSize }: { size: SizeId | null; onSize: (s: SizeId) => void }) {
  const group = useId();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-navy">Ayakkabı numarası</legend>
      <div className="grid grid-cols-3 gap-2">
        {SIZES.map(({ id, range }) => (
          <label key={id} className="cursor-pointer">
            <input type="radio" name={group} checked={size === id} onChange={() => onSize(id)} className="peer sr-only" />
            <span className="flex min-h-14 flex-col items-center justify-center rounded-xl border-2 text-sm transition-colors hover:border-navy/40 peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
              <span className="font-bold text-navy">{id}</span>
              <span className="text-xs text-muted-foreground">{range}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ---------------- 3. Wizard ---------------- */
const PURPOSES: { id: Purpose; title: string; desc: string; model: ModelId }[] = [
  { id: "daily", title: "Günlük kullanım", desc: "Günlük yürüyüş ve uzun süre ayakta kalma", model: "konfor" },
  { id: "active", title: "Aktif yaşam", desc: "Spor, egzersiz ve aktif yaşam", model: "energy" },
  { id: "support", title: "Güçlü destek", desc: "Daha güçlü ayak kavis desteği", model: "destek" },
];
const FEELS: { id: Feel; title: string; desc: string; model: ModelId }[] = [
  { id: "soft", title: "Yumuşak", desc: "Daha yumuşak ve yastıklamalı", model: "konfor" },
  { id: "balanced", title: "Dengeli", desc: "Yastıklama ve desteğin dengesi", model: "energy" },
  { id: "firm", title: "Belirgin destek", desc: "Daha güçlü ve belirgin destek", model: "destek" },
];

const REASONS: Record<ModelId, string[]> = {
  konfor: ["Günlük kullanım ve uzun süre ayakta kalmaya uygun yastıklama.", "Yumuşak his için en yüksek yastıklama seviyesi."],
  energy: ["Aktif yaşam ve spor için dinamik yastıklama.", "Yastıklama ve destek arasında dengeli yapı."],
  destek: ["Daha belirgin ayak kavis desteği için güçlendirilmiş yapı.", "Stabil kullanım hissi için tasarlandı."],
};

function Wizard({ onModel, onAdd }: {
  onModel: (m: ModelId) => void;
  onAdd: (m: ModelId, s: SizeId, trigger: HTMLButtonElement) => void;
}) {
  const [size, setSize] = useState<SizeId | null>(null);
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [feel, setFeel] = useState<Feel | null>(null);
  const [started, setStarted] = useState(false);
  const result = useMemo(() => (purpose && feel ? recommend(purpose, feel) : []), [purpose, feel]);
  const [active, setActive] = useState<ModelId | null>(null);

  const start = () => { if (!started) { setStarted(true); track("finder_start"); } };
  const next = () => setStep((s) => s + 1);

  const finish = () => {
    if (!purpose || !feel || !size) return;
    const rec = recommend(purpose, feel);
    const first = rec[0];
    if (!first) return;
    setActive(first);
    onModel(first);
    trackEcommerce("view_item", [gaItem(first, size)]);
    track("finder_complete", { recommended: rec.join(","), size });
    setStep(3);
  };

  const reset = () => { setStep(0); setPurpose(null); setFeel(null); setActive(null); };

  const OptionGrid = <T extends string>({ items, value, onPick }: { items: { id: T; title: string; desc: string; model: ModelId }[]; value: T | null; onPick: (v: T) => void }) => (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map(({ id, title, desc, model }) => (
        <button
          key={id}
          onClick={() => { start(); onPick(id); }}
          className={cn(
            "group flex items-start gap-4 rounded-2xl border-2 bg-card p-5 text-left transition-all md:flex-col",
            value === id ? "border-primary bg-accent" : "border-border hover:border-navy/30",
          )}
        >
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted p-1 ring-1 ring-inset transition-all md:h-14 md:w-14",
              value === id ? "ring-primary" : "ring-border group-hover:ring-primary/40",
            )}
          >
            <img
              src={MODEL_IMAGE[model]}
              alt={`${getModel(model).name} tabanlık`}
              className="h-full w-full scale-[1.18] object-contain drop-shadow-sm"
              loading="lazy"
            />
          </span>
          <span><span className="block font-bold text-navy">{title}</span><span className="mt-1 block text-sm text-muted-foreground">{desc}</span></span>
        </button>
      ))}
    </div>
  );

  const m = active ? getModel(active) : null;

  return (
    <section id="bulucu" className="scroll-mt-16 bg-muted py-20 md:py-28">
      <div className="mx-auto max-w-[1000px] px-5">
        <SectionHead eyebrow="Model bulucu" title="30 saniyede sana uygun SmartFit'i bul." sub="3 kısa adımda kullanımına ve destek tercihine uygun modeli keşfet." />
        <div className="rounded-3xl bg-background p-5 shadow-sm md:p-10">
          {step < 3 && (
            <div className="mb-8">
              <div className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Adım {step + 1}/3</span>
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-navy hover:underline"><ChevronLeft className="h-4 w-4" />Geri</button>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / 3) * 100}%` }} />
              </div>
            </div>
          )}

          {step === 0 && (
            <>
              <h3 className="mb-5 text-xl font-bold text-navy md:text-2xl">Tabanlığını en çok ne için kullanacaksın?</h3>
              <OptionGrid items={PURPOSES} value={purpose} onPick={(v) => { setPurpose(v); next(); }} />
            </>
          )}
          {step === 1 && (
            <>
              <h3 className="mb-5 text-xl font-bold text-navy md:text-2xl">Tabanlığından nasıl bir his beklersin?</h3>
              <OptionGrid items={FEELS} value={feel} onPick={(v) => { setFeel(v); next(); }} />
            </>
          )}
          {step === 2 && (
            <>
              <h3 className="mb-5 text-xl font-bold text-navy md:text-2xl">Ayakkabı numaranı seç.</h3>
              <SizePicker size={size} onSize={(value) => { setSize(value); track("select_size", { size: value }); }} />
              <Button size="lg" className="mt-6 h-12 w-full font-bold md:w-auto md:px-10" disabled={!size} onClick={finish}>Önerimi Gör</Button>
            </>
          )}
          {step === 3 && m && size && (
            <div>
              {result.length > 1 && (
                <div className="mb-6">
                  <p className="mb-3 text-sm font-bold text-navy">Sana uygun olabilecek iki model</p>
                  <div className="grid grid-cols-2 gap-2">
                    {result.map((id) => (
                      <button key={id} onClick={() => {
                        if (id === active) return;
                        setActive(id);
                        onModel(id);
                        trackEcommerce("view_item", [gaItem(id, size)]);
                      }}
                        className={cn("min-h-12 rounded-xl border-2 px-3 font-bold text-navy", active === id ? "border-primary bg-accent" : "border-border")}>
                        {getModel(id).name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div className={cn("aspect-square rounded-2xl p-8", modelTone[m.id].soft)}><ProductVisual model={m} /></div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Önerimiz</p>
                  <h3 className="mt-2 text-3xl font-extrabold text-navy">{m.name}</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {REASONS[m.id].map((r) => <li key={r} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{r}</li>)}
                  </ul>
                  <div className="mt-5 space-y-2">
                    <Dots label="Destek" value={m.support} model={m.id} />
                    <Dots label="Yastıklama" value={m.cushion} model={m.id} />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between border-t pt-4">
                    <span className="text-sm text-muted-foreground">Numara: <b className="text-navy">{size} ({SIZES.find((s) => s.id === size)?.range})</b></span>
                    <span className="text-2xl font-extrabold text-navy">{formatTL(PRICE_TL)}</span>
                  </div>
                  <Button size="lg" className="mt-5 h-12 w-full font-bold" onClick={(event) => onAdd(m.id, size, event.currentTarget)}>Sepete Ekle</Button>
                  <Button size="lg" variant="outline" className="mt-3 h-12 w-full font-bold" onClick={() => scrollTo("modeller")}>Diğer Modelleri İncele</Button>
                  <div className="mt-4"><PurchaseAssurance showOffers /></div>
                  <button onClick={reset} className="mt-4 w-full text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline">Seçimimi Değiştir</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Öneri yalnızca kullanım tercihlerine dayanır; tıbbi değerlendirme değildir.</p>
      </div>
    </section>
  );
}

/* ---------------- 4. Why SmartFit ---------------- */
const LAYERS = [
  { name: "Üst tekstil yüzey", material: "Polyester tekstil", desc: "Ayakla temas eden yumuşak, nefes alan yüzey." },
  { name: "Yastıklama katmanı", material: "PU / TPE foam", desc: "Modele göre 3 mm PU veya 2 mm TPE foam; adım konforunu belirler." },
  { name: "Destekleyici köpük yapı", material: "EVA", desc: "Tabanlığın formunu ve dengesini taşıyan ana gövde." },
  { name: "Ayak kavis destek elemanı", material: "TPU spine", desc: "Modele göre TPU veya naylon / cam elyaf güçlendirilmiş destek." },
];

const LAYER_IMAGES = [layer1Img, layer2Img, layer3Img, layer4Img];

function WhySmartFit() {
  const [layer, setLayer] = useState(0);
  return (
    <section id="teknoloji" className="scroll-mt-16 bg-navy-deep py-20 text-navy-foreground md:py-28">
      <div className="mx-auto max-w-[1240px] px-5">
        <Reveal><SectionHead light eyebrow="Neden SmartFit?" title="Tabanlıkların geliştirilme formülü." sub="FootBalance'ın ayak biyomekaniği deneyimi, gelişmiş malzemeler ve farklı destek ihtiyaçları için tasarlanmış üç hazır tabanlık." /></Reveal>

        <Reveal className="grid items-center gap-10 border-t border-navy-foreground/10 py-14 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-extrabold md:text-3xl">Milyonlarca ayak verisinden gelen deneyim.</h3>
            <p className="mt-4 text-navy-foreground/70">SmartFit, FootBalance'ın 10 milyondan fazla taranmış ayaktan elde edilen biyomekanik verileriyle geliştirildi. Bu deneyim, farklı destek ihtiyaçları için üç modelin tasarımına temel oluşturur.</p>
          </div>
          <div className="flex items-baseline gap-3 rounded-3xl bg-navy p-10">
            <span className="text-6xl font-extrabold text-primary md:text-7xl">10M+</span>
            <span className="text-navy-foreground/70">ayak tarama verisi</span>
          </div>
        </Reveal>

        <Reveal className="my-8 grid items-center gap-10 rounded-3xl bg-background p-6 md:grid-cols-2 md:p-12">
          <div className="order-2 md:order-1">
            <div className="relative mx-auto w-full max-w-md" aria-live="polite">
              <img
                src={layerStackImg}
                alt="SmartFit tabanlığının katmanlarına ayrılmış görünümü"
                className="w-full object-contain drop-shadow-2xl"
                loading="lazy"
              />
              {LAYER_IMAGES.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain drop-shadow-2xl transition-opacity duration-500",
                    layer === i ? "opacity-100" : "opacity-0",
                  )}
                  loading="lazy"
                />
              ))}
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-primary align-middle" />
              {LAYERS[layer]?.name}
            </p>
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-2xl font-extrabold md:text-3xl text-navy">Her katmanın bir amacı var.</h3>
            <p className="mt-4 text-muted-foreground">Ayağınla temas eden yumuşak yüzeyden kavis desteğine: her katman basış hissinin farklı bir parçasını tamamlar.</p>
            <ol className="mt-7">
              {LAYERS.map((l, i) => {
                const active = layer === i;
                return (
                  <li key={l.name}>
                    <button
                      onClick={() => setLayer(i)}
                      aria-pressed={active}
                      className={cn(
                        "group flex w-full items-start gap-4 border-l-2 py-4 pl-5 text-left transition-all first:pt-0 last:pb-0",
                        active ? "border-primary" : "border-border hover:border-navy/30",
                      )}
                    >
                      <span className={cn("text-2xl font-extrabold tabular-nums transition-colors", active ? "text-primary" : "text-border group-hover:text-navy/40")}>
                        0{i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className={cn("font-bold transition-colors", active ? "text-navy" : "text-navy/70")}>{l.name}</span>
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors",
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          )}>
                            {l.material}
                          </span>
                        </span>
                        <span className={cn("mt-1 block text-sm leading-relaxed transition-colors", active ? "text-navy/80" : "text-muted-foreground")}>
                          {l.desc}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

/* ---------------- 7A. Google Reviews (hidden when empty) ---------------- */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("flex gap-0.5", className)} role="img" aria-label={`${value}/5 yıldız`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-4 w-4", i <= value ? "fill-[#FBBC05] text-[#FBBC05]" : "fill-border text-border")} />
      ))}
    </span>
  );
}

function Reviews() {
  const shown = REVIEWS.filter((r) => r.rating >= 4).sort((a, b) => b.rating - a.rating);
  if (shown.length === 0) return null;
  const avg = shown.reduce((n, r) => n + r.rating, 0) / shown.length;
  return (
    <section id="yorumlar" className="scroll-mt-16 border-t bg-muted py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-5">
        <SectionHead eyebrow="Müşteri yorumları" title="SmartFit kullanıcılarının deneyimleri." sub="Google'da yayınlanan gerçek müşteri yorumları." />
        <Reveal className="mx-auto mb-10 flex w-fit items-center gap-4 rounded-2xl border bg-card px-6 py-4">
          <GoogleMark className="h-8 w-8" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-navy">{avg.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
              <Stars value={Math.round(avg)} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{shown.length} Google yorumu</p>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {shown.map((r, i) => (
            <Reveal key={i}>
              <figure className="flex h-full flex-col rounded-3xl border bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <GoogleMark className="h-5 w-5 shrink-0" />
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-navy">“{r.text}”</blockquote>
                <figcaption className="mt-5 border-t pt-4">
                  <p className="text-sm font-bold text-navy">{r.author}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {getModel(r.model).name}
                    {r.date && ` · ${r.date}`}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- Google reviews strip (hidden until real reviews exist) -------- */
function ReviewsBanner() {
  const shown = REVIEWS.filter((r) => r.rating >= 4);
  if (shown.length === 0) return null;
  const avg = shown.reduce((n, r) => n + r.rating, 0) / shown.length;
  return (
    <section className="px-5 pb-20">
      <Reveal className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 rounded-3xl border bg-card px-6 py-8 md:flex-row md:justify-between md:gap-8 md:px-10">
        <div className="flex items-center gap-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
            <Quote className="h-5 w-5 text-navy" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-navy">Gerçek deneyimler. Güvenli adımlar.</p>
            <p className="mt-1 text-sm text-muted-foreground">Kullanıcılarımızın Google yorumlarını keşfet.</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-navy">Google</span>
            <span className="text-xl font-extrabold text-navy">{avg.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
            <Stars value={Math.round(avg)} />
            <span className="text-sm text-muted-foreground">({shown.length} yorum)</span>
          </div>
          <Button className="h-11 rounded-full px-6 font-bold" onClick={() => scrollTo("yorumlar")}>
            Yorumları incele <ArrowDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- 7B. FAQ ---------------- */
const FAQS: [string, string][] = [
  ["SmartFit hazır tabanlık mı?", "Evet. SmartFit modelleri kullanıma hazır tabanlıklardır; şekillendirme veya ek işlem gerektirmez."],
  ["Konfor, Energy ve Destek arasındaki farklar nelerdir?", "Konfor, gün boyu ayakta kalanlar ve üst seviye konfor hissi arayanlar içindir. Energy, aktif spor yapanlar, performans ve destek arayanlara özeldir. Destek ise basış problemi yaşayanlar için güçlü kavis desteği sunar."],
  ["Bana uygun SmartFit modelini nasıl seçebilirim?", "Yukarıdaki 3 adımlı model bulucuyu kullanabilir veya Modeller bölümünden üç modeli inceleyebilirsin."],
  ["SmartFit'i mevcut ayakkabımda kullanabilir miyim?", "Mevcut tabanlığı çıkarılabilen ayakkabılarda, eski tabanlığın yerine yerleştirilerek kullanılır."],
  ["Hangi ayakkabı numarasını almalıyım?", "Normalde giydiğin ayakkabı numarasına göre seç: XS 36–37, S 38–39, M 40–41, L 42–43, XL 44–45, XXL 46–47."],
  ["SmartFit tabanlık nasıl temizlenir?", CLEANING_TEXT],
  ["Siparişim ne zaman kargoya verilir?", DISPATCH_TEXT],
  ["Memnun kalmazsam iade edebilir miyim?", RETURN_TEXT],
];

function Faq() {
  return (
    <section id="sss" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHead title="Sıkça sorulan sorular" />
        <Accordion type="single" collapsible onValueChange={(v) => v && track("faq_open", { question: v })}>
          {FAQS.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="py-5 text-left text-base font-bold text-navy">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- Closing ---------------- */
function Closing({ onCta }: { onCta: () => void }) {
  return (
    <section id="kapanis" className="px-5 pb-20">
      <div className="mx-auto max-w-[1240px] rounded-[2rem] bg-navy px-6 py-16 text-center text-navy-foreground md:py-24">
        <h2 className="text-3xl font-extrabold tracking-tight text-balance md:text-5xl">Şimdi sana uygun desteği keşfet.</h2>
        <p className="mx-auto mt-4 max-w-xl text-navy-foreground/70">Konfor, Energy veya Destek. SmartFit ile bir sonraki adımını seç.</p>
        <p className="mt-8 text-4xl font-extrabold">{formatTL(PRICE_TL)}</p>
        <Button size="lg" className="mt-6 h-12 px-10 text-base font-bold" onClick={onCta}>SmartFit'imi Seç</Button>
      </div>
    </section>
  );
}

function ContactItem({ icon: Icon, label, value, href }: {
  icon: LucideIcon; label: string; value: string; href?: string;
}) {
  const body = (
    <>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-navy transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="block font-semibold text-navy">{value}</span>
      </span>
    </>
  );
  if (!href) return <div className="flex items-start gap-3">{body}</div>;
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="group flex items-start gap-3"
    >
      {body}
    </a>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10 pb-28 md:pb-10">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 text-sm md:flex-row md:items-start md:justify-between">
        <div>
          <span className="font-extrabold text-navy">FootBalance</span>
          <p className="mt-2 max-w-xs text-muted-foreground">
            Finlandiya mühendisliğiyle geliştirilen akıllı tabanlık desteği.
          </p>
        </div>
        {hasContact() && (
          <div className="grid gap-4 sm:grid-cols-2 md:gap-x-12">
            {CONTACT.phone && (
              <ContactItem icon={Phone} label="Telefon" value={CONTACT.phone} href={telHref(CONTACT.phone)} />
            )}
            {CONTACT.whatsapp && (
              <ContactItem icon={MessageCircle} label="WhatsApp" value={CONTACT.whatsapp} href={waHref(CONTACT.whatsapp)} />
            )}
            {CONTACT.email && (
              <ContactItem icon={Mail} label="E-posta" value={CONTACT.email} href={mailHref(CONTACT.email)} />
            )}
            {CONTACT.address && (
              <ContactItem icon={MapPin} label="Adres" value={CONTACT.address} />
            )}
            {CONTACT.instagram && (
              <ContactItem
                icon={Instagram}
                label="Instagram"
                value={`@${CONTACT.instagram.replace(/^@/, "")}`}
                href={igHref(CONTACT.instagram)}
              />
            )}
          </div>
        )}
      </div>
    </footer>
  );
}

/* ---------------- Purchase & cart ---------------- */
function BuySheet({ open, onOpenChange, onCloseAutoFocus, model, size, onModel, onSize, onAdd }: {
  open: boolean; onOpenChange: (o: boolean) => void; onCloseAutoFocus: (event: Event) => void; model: ModelId | null; size: SizeId | null;
  onModel: (m: ModelId) => void; onSize: (s: SizeId) => void; onAdd: (m: ModelId, s: SizeId) => void;
}) {
  const group = useId();
  const ok = !!(model && size && hasVariant(model, size));
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" onCloseAutoFocus={onCloseAutoFocus} className="max-h-[92dvh] overflow-y-auto rounded-t-3xl md:mx-auto md:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-xl font-extrabold text-navy">SmartFit'ini seç</SheetTitle>
          <SheetDescription>Model ve ayakkabı numarası seç · {formatTL(PRICE_TL)} KDV dahil</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6">
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-navy">Model</legend>
            <div className="grid grid-cols-3 gap-2">
              {MODELS.map((m) => (
                <label key={m.id} className="cursor-pointer">
                  <input type="radio" name={group} aria-label={m.name} checked={model === m.id} onChange={() => onModel(m.id)} className="peer sr-only" />
                  <span className="flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-colors peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    <span className={cn("h-16 w-full rounded-lg p-1", modelTone[m.id].soft)} aria-hidden="true"><ProductVisual model={m} /></span>
                    <span className="text-sm font-bold text-navy">{m.short}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <SizePicker size={size} onSize={onSize} />
          <Button size="lg" className="h-12 w-full text-base font-bold" disabled={!ok} onClick={() => { if (model && size) onAdd(model, size); }}>
            {ok ? `Sepete ekle · ${formatTL(PRICE_TL)}` : "Önce numaranı seç"}
          </Button>
          <PurchaseAssurance />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CartSheet({ open, onOpenChange, onCloseAutoFocus, cart, message, onRemove }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
  cart: CartLine[];
  message: string;
  onRemove: (line: CartLine) => void;
}) {
  const title = useRef<HTMLHeadingElement>(null);
  const checkoutUrl = shopifyCartUrl(cart);
  const total = cart.reduce((sum, line) => sum + line.quantity * PRICE_TL, 0);
  const checkout = () => {
    trackEcommerce("begin_checkout", cart.map((item) => ({
      ...gaItem(item.model, item.size),
      quantity: item.quantity,
    })));
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          title.current?.focus();
        }}
        onCloseAutoFocus={onCloseAutoFocus}
        className="flex w-full flex-col overflow-y-auto px-4 sm:w-3/4 sm:px-6"
      >
        <SheetHeader>
          <SheetTitle ref={title} tabIndex={-1} className="text-xl font-extrabold text-navy">Sepetin</SheetTitle>
          <SheetDescription>
            <span role="status" className="sr-only">{message}</span>
            {cart.length ? "Ürünlerini kontrol et." : "Sepetin boş."}
          </SheetDescription>
        </SheetHeader>
        <ul aria-label="Sepetteki ürünler" className="flex-1 space-y-3 px-4">
          {cart.map((i) => {
            const m = getModel(i.model);
            return (
              <li key={i.model + i.size} className="flex items-center gap-3 rounded-2xl border p-3">
                <div className={cn("h-16 w-16 shrink-0 rounded-xl p-1", modelTone[m.id].soft)}><ProductVisual model={m} /></div>
                <div className="flex-1">
                  <p className="font-bold text-navy">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{i.size} ({SIZES.find(({ id }) => id === i.size)?.range}) · Adet {i.quantity}</p>
                  <p className="text-sm font-semibold">{formatTL(PRICE_TL * i.quantity)}</p>
                </div>
                <button aria-label={`Kaldır: ${m.name} ${i.size}`} className="min-h-11 shrink-0 rounded-lg px-2 text-xs font-semibold underline-offset-4 hover:bg-muted hover:underline"
                  onClick={() => { title.current?.focus(); onRemove(i); }}>Kaldır</button>
              </li>
            );
          })}
        </ul>
        <div className="space-y-3 border-t p-4">
          {cart.length > 0 && (
            <>
              <div className="flex justify-between font-extrabold text-navy"><span>Toplam (KDV dahil)</span><span>{formatTL(total)}</span></div>
              <PurchaseAssurance showOffers />
              {checkoutUrl && (
                <>
                  <Button asChild size="lg" className="h-12 w-full font-bold">
                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={checkout}>Ödemeye geç</a>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Sepetin Shopify mağazasında yeni sekmede açılır. Ödemeni orada tamamlayabilirsin.</p>
                </>
              )}
            </>
          )}
          <Button type="button" variant="outline" size="lg" className="h-12 w-full font-bold" onClick={() => onOpenChange(false)}>
            Alışverişe Devam Et
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
