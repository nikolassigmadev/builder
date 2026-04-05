import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, getAnimClass, hFont, bFont, hW } from "./helpers";
import { Badge, CTAButton } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function AboutSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "split";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.background), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  const textBlock = (
    <div className={animClass}>
      <Badge label={data.label} colors={colors} co={co} />
      <h2 className="text-4xl md:text-5xl tracking-tight mb-6 leading-tight"
        style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>{data.title}</h2>
      <p className="text-lg leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.65, fontFamily: bFont(ty) }}>{data.description}</p>
      {data.ctaText && (
        <a href={data.ctaLink || "#"} className="inline-block mt-8 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs) }}>{data.ctaText}</a>
      )}
    </div>
  );

  const statsBlock = data.stats && data.stats.length > 0 && (
    <div className={`grid grid-cols-2 gap-4 ${animClass}`}>
      {data.stats.map((stat: any) => (
        <div key={stat.label} className="p-6 flex flex-col gap-2" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
          <span className="text-3xl font-black tracking-tight" style={{ color: p, fontFamily: hFont(ty) }}>{stat.value}</span>
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: co?.text ?? colors.text, opacity: 0.55 }}>{stat.label}</span>
        </div>
      ))}
    </div>
  );

  if (layout === "centered") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto text-center`}>
          <Badge label={data.label} colors={colors} co={co} />
          <h2 className="text-4xl md:text-5xl tracking-tight mb-6"
            style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>{data.title}</h2>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-12" style={{ color: co?.text ?? colors.text, opacity: 0.65 }}>{data.description}</p>
          {data.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.stats.map((stat: any) => (
                <div key={stat.label} className="p-6 text-center" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                  <span className="text-3xl font-black block" style={{ color: p }}>{stat.value}</span>
                  <span className="text-sm uppercase tracking-wider mt-1 block" style={{ color: co?.text ?? colors.text, opacity: 0.55 }}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          {data.ctaText && <div className="mt-8"><CTAButton text={data.ctaText} link={data.ctaLink} primary colors={colors} ss={ss} /></div>}
        </div>
      </section>
    );
  }

  if (layout === "stacked") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <div className="mb-12">{textBlock}</div>
          {statsBlock && <div className={`grid grid-cols-2 md:grid-cols-${Math.min(data.stats?.length ?? 4, 4)} gap-4`}>{data.stats?.map((stat: any) => (
            <div key={stat.label} className="p-6 text-center" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              <span className="text-3xl font-black block" style={{ color: p }}>{stat.value}</span>
              <span className="text-sm uppercase tracking-wider mt-1 block" style={{ color: co?.text ?? colors.text, opacity: 0.55 }}>{stat.label}</span>
            </div>
          ))}</div>}
        </div>
      </section>
    );
  }

  // Default: split
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto grid md:grid-cols-2 gap-16 items-center`}>
        {textBlock}
        {statsBlock}
      </div>
    </section>
  );
}
