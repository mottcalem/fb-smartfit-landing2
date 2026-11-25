import { SectionHead } from "@/components/smartfit/ui";

const VIDEOS = [
  { slug: "ayakkabin-ayni-kalsin", title: "Ayakkabın aynı kalsın" },
  { slug: "iceriden-bak", title: "İçeriden bak" },
  { slug: "gunun-sonunda", title: "Günün sonunda" },
  { slug: "uymazsa", title: "Uymazsa" },
  { slug: "hangisi-bana-gore", title: "Hangisi bana göre?" },
];

export function Videos() {
  return (
    <section
      id="videolar"
      aria-label="SmartFit videoları"
      className="scroll-mt-16 border-t py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="px-5">
          <SectionHead title="SmartFit videoları" />
        </div>
        <ul className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:flex-wrap sm:justify-center">
          {VIDEOS.map(({ slug, title }) => (
            <li key={slug} className="w-56 shrink-0 snap-center lg:w-60">
              <video
                aria-label={title}
                controls
                playsInline
                preload="none"
                poster={`/videos/${slug}.jpg`}
                className="aspect-[9/16] w-full rounded-2xl bg-navy"
              >
                <source src={`/videos/${slug}.mp4`} type="video/mp4" />
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
