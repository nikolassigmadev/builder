import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, getAnimClass, hFont, bFont } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TestimonialsSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "cards";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.secondary), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  const TestimonialCard = ({ t }: { t: any }) => (
    <div className={`p-8 flex flex-col gap-6 ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
      <div className="flex gap-1" aria-label="5 stars">{[...Array(t.rating ?? 5)].map((_, i) => <span key={i} style={{ color: p }}>{"\u2605"}</span>)}</div>
      <div className="relative">
        <span className="absolute -top-2 -left-1 text-5xl leading-none font-serif select-none" style={{ color: p, opacity: 0.3 }} aria-hidden="true">&ldquo;</span>
        <p className="text-base leading-relaxed pl-5 pt-2 italic" style={{ color: co?.text ?? colors.text, opacity: 0.8, fontFamily: bFont(ty) }}>{t.text}</p>
      </div>
      <div className="flex items-center gap-3 mt-auto">
        {t.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ backgroundColor: p, color: "#fff" }}>{(t.name ?? "?").charAt(0)}</div>
        )}
        <div>
          <p className="font-bold text-sm" style={{ color: co?.text ?? colors.text, fontFamily: bFont(ty) }}>{t.name}</p>
          <p className="text-xs" style={{ color: co?.text ?? colors.text, opacity: 0.45 }}>{t.role}</p>
        </div>
      </div>
    </div>
  );

  if (layout === "large") {
    const [featured, ...rest] = data.items ?? [];
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          {featured && (
            <div className="mb-8 p-12 relative overflow-hidden" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              <span className="absolute top-6 left-8 text-[120px] leading-none font-serif opacity-10 select-none" style={{ color: p }}>&ldquo;</span>
              <div className="flex gap-1 mb-6">{[...Array(featured.rating ?? 5)].map((_, i) => <span key={i} style={{ color: p }}>{"\u2605"}</span>)}</div>
              <p className="text-2xl md:text-3xl leading-relaxed italic mb-8" style={{ color: co?.text ?? colors.text, fontFamily: bFont(ty) }}>{featured.text}</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black" style={{ backgroundColor: p, color: "#fff" }}>{(featured.name ?? "?").charAt(0)}</div>
                <div>
                  <p className="font-bold" style={{ color: co?.text ?? colors.text }}>{featured.name}</p>
                  <p className="text-sm" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{featured.role}</p>
                </div>
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">{rest.map((t: any) => <TestimonialCard key={t.name} t={t} />)}</div>
          )}
        </div>
      </section>
    );
  }

  // Default: 3-col cards
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className={`grid gap-6 ${(data.items ?? []).length === 2 ? "md:grid-cols-2" : (data.items ?? []).length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
          {(data.items ?? []).map((t: any) => <TestimonialCard key={t.name} t={t} />)}
        </div>
      </div>
    </section>
  );
}
