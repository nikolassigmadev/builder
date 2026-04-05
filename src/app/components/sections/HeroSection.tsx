import { SP } from "./types";
import { getBR, getMW, getSectionBg, getAnimClass, hFont, bFont, hW } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function HeroSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "centered";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bg = getSectionBg(ss, undefined);
  const defaultBg = { background: `radial-gradient(ellipse at 50% 0%, ${colors.secondary} 0%, ${colors.background} 65%)` };
  const sectionBg = bg.backgroundColor || bg.backgroundImage ? bg : defaultBg;
  const animClass = getAnimClass(ss, gs);

  if (layout === "split") {
    return (
      <section className="relative min-h-screen flex items-center px-6 pt-20" style={sectionBg}>
        <div className={`${getMW(ss, gs)} mx-auto grid md:grid-cols-2 gap-16 items-center w-full`}>
          <div className={animClass}>
            {data.badge && (
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full"
                style={{ backgroundColor: `${p}20`, color: co?.accent ?? colors.accent, border: `1px solid ${p}40` }}>{data.badge}</span>
            )}
            <h1 className="text-5xl md:text-7xl tracking-tighter leading-none mb-6"
              style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>
              {data.headline}
            </h1>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.7, fontFamily: bFont(ty) }}>{data.subheadline}</p>
            <div className="flex flex-wrap gap-4">
              {data.ctaText && (
                <a href={data.ctaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs), boxShadow: `0 8px 32px ${p}40` }}>{data.ctaText}</a>
              )}
              {data.secondaryCtaText && (
                <a href={data.secondaryCtaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
                  style={{ border: `2px solid ${p}`, color: co?.accent ?? colors.accent, borderRadius: getBR(ss, gs) }}>{data.secondaryCtaText}</a>
              )}
            </div>
          </div>
          <div className="relative">
            {data.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageUrl} alt={data.headline} className="w-full h-full object-cover"
                style={{ borderRadius: getBR(ss, gs), boxShadow: `0 20px 80px ${p}30` }} />
            ) : (
              <div className="aspect-square rounded-2xl flex items-center justify-center text-8xl"
                style={{ background: `radial-gradient(ellipse, ${p}25 0%, ${colors.secondary} 100%)`, border: `1px solid ${p}30`, borderRadius: getBR(ss, gs) }}>
                {data.heroIcon ?? "\ud83d\udcaa"}
              </div>
            )}
            {data.stats && data.stats.length > 0 && (
              <div className="absolute -bottom-6 -left-6 grid grid-cols-2 gap-px overflow-hidden"
                style={{ borderRadius: getBR(ss, gs), border: `1px solid ${p}20`, backgroundColor: `${p}10` }}>
                {data.stats.slice(0, 2).map((s: any) => (
                  <div key={s.label} className="px-5 py-4" style={{ backgroundColor: `${colors.background}ee` }}>
                    <span className="text-xl font-black block" style={{ color: p }}>{s.value}</span>
                    <span className="text-xs uppercase tracking-widest" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "minimal") {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20"
        style={Object.keys(sectionBg).length > 0 ? sectionBg : { backgroundColor: colors.background }}>
        <div className={`${getMW(ss, gs)} mx-auto text-center ${animClass}`}>
          {data.badge && (
            <span className="inline-block text-xs font-medium uppercase tracking-[0.4em] mb-8"
              style={{ color: p }}>{data.badge}</span>
          )}
          <h1 className="text-7xl md:text-9xl tracking-tighter leading-none mb-8"
            style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>
            {data.headline}
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-xl mx-auto" style={{ color: co?.text ?? colors.text, opacity: 0.55, fontFamily: bFont(ty) }}>{data.subheadline}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {data.ctaText && (
              <a href={data.ctaLink || "#"} className="px-10 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:-translate-y-1"
                style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs) }}>{data.ctaText}</a>
            )}
            {data.secondaryCtaText && (
              <a href={data.secondaryCtaLink || "#"} className="px-10 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:-translate-y-1"
                style={{ border: `1px solid ${co?.text ?? colors.text}30`, color: co?.text ?? colors.text, borderRadius: getBR(ss, gs) }}>{data.secondaryCtaText}</a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default: centered
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20" style={sectionBg}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${p}20 0%, transparent 70%)`, filter: "blur(40px)" }} />
      {data.imageUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.imageUrl} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${colors.background}80 0%, ${colors.background} 100%)` }} />
        </div>
      )}
      <div className={`relative z-10 ${getMW(ss, gs)} mx-auto ${animClass}`}>
        {data.badge && (
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: `${p}20`, color: co?.accent ?? colors.accent, border: `1px solid ${p}40` }}>{data.badge}</span>
        )}
        <h1 className="text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none mb-6"
          style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>
          {(data.headline ?? "").split(" ").map((word: string, i: number, arr: string[]) => (
            <span key={i}>{i === 1 ? <span style={{ color: p }}>{word}</span> : word}{i < arr.length - 1 ? " " : ""}</span>
          ))}
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: co?.text ?? colors.text, opacity: 0.7, fontFamily: bFont(ty) }}>{data.subheadline}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {data.ctaText && (
            <a href={data.ctaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs), boxShadow: `0 8px 32px ${p}40` }}>{data.ctaText}</a>
          )}
          {data.secondaryCtaText && (
            <a href={data.secondaryCtaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: `2px solid ${p}`, color: co?.accent ?? colors.accent, borderRadius: getBR(ss, gs) }}>{data.secondaryCtaText}</a>
          )}
        </div>
        {data.stats && data.stats.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden"
            style={{ border: `1px solid ${p}20`, backgroundColor: `${p}10`, borderRadius: getBR(ss, gs) }}>
            {data.stats.map((stat: any) => (
              <div key={stat.label} className="flex flex-col items-center justify-center py-6 px-4" style={{ backgroundColor: `${colors.background}cc` }}>
                <span className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: p }}>{stat.value}</span>
                <span className="text-xs uppercase tracking-widest mt-1" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: co?.text ?? colors.text, opacity: 0.35 }}>Scroll</span>
        <div className="w-px h-12" style={{ background: `linear-gradient(to bottom, ${p}80, transparent)` }} />
      </div>
    </section>
  );
}
