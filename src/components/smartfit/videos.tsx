import { SectionHead } from "@/components/smartfit/ui";

const VIDEO_IDS = [
  "V6U9vrksHa0",
  "rvulvSeM5ls",
  "3l4bf2x_FQI",
  "6Y5WxEkUG_U",
  "ghoDQkD1eOQ",
  "xDsBzEMsIQY",
  "Oauhl4iqUFY",
];

export function Videos() {
  return (
    <section id="videolar" aria-label="SmartFit videoları" className="scroll-mt-16 border-t py-20 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="px-5">
          <SectionHead title="SmartFit videoları" />
        </div>
        <ul className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:flex-wrap sm:justify-center">
          {VIDEO_IDS.map((id, index) => (
            <li key={id} className="w-56 shrink-0 snap-center lg:w-60">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?controls=0&fs=0`}
                title={`SmartFit videosu ${index + 1}`}
                loading="lazy"
                allow="encrypted-media"
                className="aspect-[9/16] w-full rounded-2xl bg-navy"
              />
              <a
                href={`https://www.youtube.com/shorts/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`SmartFit videosu ${index + 1} · YouTube’da izle (yeni sekme)`}
                className="mt-2 inline-block text-sm font-semibold text-navy underline underline-offset-4"
              >
                YouTube’da izle
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
