import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Model, ModelId } from "@/lib/smartfit";
import konforPhoto from "@/assets/smartfit-konfor-stage.webp";
import energyPhoto from "@/assets/smartfit-energy-stage.webp";
import destekPhoto from "@/assets/smartfit-destek-stage.webp";
import familyImg from "@/assets/smartfit-family.webp";

/** Real FootBalance product photos per model. */
export const MODEL_IMAGE: Record<ModelId, string> = {
  konfor: konforPhoto,
  energy: energyPhoto,
  destek: destekPhoto,
};

export const FAMILY_IMAGE = familyImg;

export const modelTone: Record<ModelId, { bg: string; soft: string; text: string; fill: string }> = {
  konfor: { bg: "bg-konfor", soft: "bg-konfor-soft", text: "text-konfor", fill: "fill-konfor" },
  energy: { bg: "bg-energy", soft: "bg-energy-soft", text: "text-energy", fill: "fill-energy" },
  destek: { bg: "bg-destek", soft: "bg-destek-soft", text: "text-destek", fill: "fill-destek" },
};

export function Dots({ value, label, model }: { value: number; label: string; model: ModelId }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex gap-1.5" role="img" aria-label={`${label}: ${value}/3`}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-2.5 w-6 rounded-full", i <= value ? modelTone[model].bg : "bg-border")}
          />
        ))}
      </span>
    </div>
  );
}

/** Real FootBalance product photo for the model. */
export function ProductVisual({ model, className, priority }: { model: Model; className?: string; priority?: boolean }) {
  return (
    <img
      src={MODEL_IMAGE[model.id]}
      alt={`FootBalance ${model.name} tabanlık`}
      className={cn("h-full w-full object-contain drop-shadow-xl", className)}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

/** Real family shot of all three SmartFit models. */
export function FamilyVisual({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <img
      src={FAMILY_IMAGE}
      alt="FootBalance SmartFit Konfor, Energy ve Destek tabanlık ailesi"
      className={cn("h-full w-full object-contain drop-shadow-2xl", className)}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

export function Reveal({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={cn("reveal", className)}>
      {children}
    </Tag>
  );
}

export function SectionHead({ eyebrow, title, sub, light }: { eyebrow?: string; title: string; sub?: string; light?: boolean }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      {eyebrow && <p className="mb-3 text-xs font-bold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>}
      <h2 className={cn("text-3xl font-extrabold tracking-tight text-balance md:text-5xl", light ? "text-navy-foreground" : "text-navy")}>
        {title}
      </h2>
      {sub && <p className={cn("mt-4 text-base md:text-lg", light ? "text-navy-foreground/70" : "text-muted-foreground")}>{sub}</p>}
    </div>
  );
}
