import { CSSProperties } from "react";
import { SP } from "./types";
import { getBR, getMW, getSectionBg, getAnimClass, hFont, bFont } from "./helpers";

export function CtaBannerSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "default";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const animClass = getAnimClass(ss, gs);

  const defaultBg: CSSProperties = layout === "gradient"
    ? { background: `linear-gradient(135deg, ${p} 0%, ${co?.accent ?? colors.accent}88 100%)` }
    : { backgroundColor: p };
  const bgSty = getSectionBg(ss, undefined);
  const finalBg = bgSty.backgroundColor || bgSty.background ? bgSty : defaultBg;

  if (layout === "split") {
    return (
      <section className="py-20 px-6" style={finalBg}>
        <div className={`${getMW(ss, gs)} mx-auto flex flex-col md:flex-row items-center justify-between gap-8 ${animClass}`}>
          <div>
            <h2 className="text-4xl font-black tracking-tight" style={{ color: "#fff", fontFamily: hFont(ty) }}>{data.title}</h2>
            {data.description && <p className="text-lg mt-3 max-w-xl" style={{ color: "rgba(255,255,255,0.8)", fontFamily: bFont(ty) }}>{data.description}</p>}
          </div>
          {data.ctaText && (
            <a href={data.ctaLink || "#"} className="flex-shrink-0 inline-block px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
              style={{ backgroundColor: "#fff", color: p, borderRadius: getBR(ss, gs) }}>{data.ctaText}</a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6" style={finalBg}>
      <div className={`${getMW(ss, gs)} mx-auto text-center ${animClass}`}>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: "#fff", fontFamily: hFont(ty) }}>{data.title}</h2>
        {data.description && <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.8)", fontFamily: bFont(ty) }}>{data.description}</p>}
        {data.ctaText && (
          <a href={data.ctaLink || "#"} className="inline-block px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
            style={{ backgroundColor: "#fff", color: p, borderRadius: getBR(ss, gs) }}>{data.ctaText}</a>
        )}
      </div>
    </section>
  );
}
