import { RotateCcw, Truck, Check, PackageCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STORE_TERMS, RETURN_TEXT } from "@/lib/smartfit-policies";
import { MODEL_IMAGE, Reveal, SectionHead } from "@/components/smartfit/ui";
import insoleToShoeImg from "@/assets/smartfit-insole-to-shoe.webp";

export function PurchaseAssurance({ showOffers = false }: { showOffers?: boolean }) {
  return (
    <ul className={cn("flex gap-x-5 gap-y-2 text-xs font-semibold text-navy", showOffers ? "flex-col" : "flex-wrap")}>
      <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 shrink-0 text-primary" />{STORE_TERMS.unconditionalReturnDays} gün koşulsuz iade</li>
      <li className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0 text-primary" />{STORE_TERMS.dispatchBusinessDays} iş gününde kargoya verilir</li>
      {showOffers && (
        <>
          <li className="flex items-center gap-2"><PackageCheck className="h-4 w-4 shrink-0 text-primary" />{STORE_TERMS.freeShippingLabel}</li>
          <li className="flex items-center gap-2"><Tag className="h-4 w-4 shrink-0 text-primary" />{STORE_TERMS.cartDiscountLabel}</li>
        </>
      )}
    </ul>
  );
}

const BENEFITS = [
  { model: "konfor" as const, time: "Günlük hayat", title: "Ayakta geçen günlere yumuşaklık.", desc: "Konfor'un yüksek yastıklaması ve esnek kavis desteği, günlük yürüyüşlerde ve ayakta kaldığın anlarda daha yumuşak bir basış hissi için tasarlandı." },
  { model: "energy" as const, time: "Hareket zamanı", title: "Tempolu adımlara dengeli destek.", desc: "Energy'nin dinamik yastıklaması ve kontrollü orta ayak yapısı, spor ve aktif yaşamda yastıklama ile desteği bir araya getirir." },
  { model: "destek" as const, time: "Destek ihtiyacı", title: "Her adımda daha belirgin destek.", desc: "Destek'in güçlendirilmiş kavis yapısı, daha sağlam bir destek ve stabil kullanım hissi tercih edenler için geliştirildi." },
];

export function DailyBenefits() {
  return (
    <section id="fayda" className="border-b py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-5">
        <Reveal><SectionHead eyebrow="Adımlarında ne değişir?" title="Ayakkabın aynı. Basış hissin farklı." sub="Yumuşaklık, dinamik yastıklama veya belirgin kavis desteği. SmartFit'i gün içinde en çok ihtiyaç duyduğun hisse göre seç." /></Reveal>
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {BENEFITS.map((b) => (
            <Reveal key={b.model} className="border-t pt-6">
              <div className="flex items-center gap-4">
                <img src={MODEL_IMAGE[b.model]} alt={`SmartFit ${b.model} tabanlık`} className="h-16 w-16 shrink-0 object-contain" loading="lazy" />
                <p className="text-xs font-bold uppercase text-muted-foreground">{b.time}</p>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-navy">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">Konfor hissi kişiye, seçilen modele ve ayakkabı uyumuna göre değişebilir.</p>
      </div>
    </section>
  );
}

export function InsoleDifference() {
  return (
    <section id="smartfit-farki" className="py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-5">
        <Reveal><SectionHead eyebrow="Neden ayrı bir tabanlık?" title="İyi bir ayakkabı yetmez. Sana uygun bir destek." sub="Ayakkabının içindeki tabanlık da basış hissinin bir parçasıdır. SmartFit, çıkarılabilir mevcut tabanlığın yerine farklı destek seçenekleri sunar." /></Reveal>
        <Reveal className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <img src={insoleToShoeImg} alt="FootBalance tabanlığın ayakkabıya yerleştirilmesi" className="aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" />
          <div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4 text-sm font-extrabold text-navy"><span>Mevcut tabanlığın</span><span>SmartFit</span></div>
            {[
              ["Yastıklama ve yapı ayakkabıya göre değişir.", "İhtiyacına göre üç yastıklama / destek dengesi."],
              ["Kavis desteği her tabanlıkta aynı değildir.", "Esnek, dengeli veya güçlendirilmiş kavis desteği."],
              ["Uyumu ayakkabının iç yapısına bağlıdır.", "XS–XXL seçenekleri; 36–47 numara aralığı."],
            ].map(([existing, smartfit]) => (
              <div key={existing} className="grid grid-cols-2 gap-4 border-b py-5 text-sm leading-relaxed">
                <p className="text-muted-foreground">{existing}</p>
                <p className="text-navy">{smartfit}</p>
              </div>
            ))}
            <p className="mt-4 text-xs text-muted-foreground">Mevcut tabanlığı çıkarılabilen ve yeterli iç hacmi olan ayakkabılarda uyumu kontrol et.</p>
            <Button asChild size="lg" className="mt-6 h-12 w-full font-bold sm:w-auto">
              <a href="#modeller">Ürünleri Keşfet</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function UsageGuide() {
  return (
    <section id="kullanim" className="bg-muted py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-5">
        <Reveal><SectionHead eyebrow="Kullanıma hazır" title="Üç adımda ayakkabında." sub="Şekillendirme veya ek işlem gerektirmez." /></Reveal>
        <Reveal className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <img src={insoleToShoeImg} alt="FootBalance tabanlığı ayakkabıya yerleştiren el" className="aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" />
          <ol className="self-center">
            {[
              ["Mevcut tabanlığı çıkar.", "Ayakkabının içindeki çıkarılabilir tabanlığı al. SmartFit'i eski tabanlığın üzerine yerleştirme."],
              ["SmartFit'i yerleştir.", "Tabanlığı ayakkabının içine oturt; topuk bölümünün ve ön kısmın düz yerleştiğini kontrol et."],
              ["Uyumu kontrol et.", "Ayakkabını giyip birkaç adım at. Ayağının sıkışmadığından ve tabanlığın kaymadığından emin ol."],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-5 border-b py-6 first:pt-0">
                <span className="text-2xl font-extrabold text-primary">0{i + 1}</span>
                <div><h3 className="text-lg font-bold text-navy">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p></div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

export function TrialAssurance() {
  return (
    <section id="guvence" className="border-y bg-accent py-14 md:py-20">
      <Reveal className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 md:grid-cols-[1fr_auto]">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-navy"><Check className="h-4 w-4 text-primary" />Satın alma güvencen</p>
          <h2 className="text-3xl font-extrabold text-navy md:text-4xl">Konforu kendi adımlarında değerlendir.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">{RETURN_TEXT}</p>
          <div className="mt-5"><PurchaseAssurance /></div>
        </div>
        <Button size="lg" className="h-12 px-8 font-bold" onClick={() => document.getElementById("bulucu")?.scrollIntoView({ behavior: "smooth" })}>Bana Uygun SmartFit'i Bul</Button>
      </Reveal>
    </section>
  );
}
