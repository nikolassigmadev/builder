import { SP } from "./types";
import { getBR, getPad, getSectionBg, hFont, bFont, hW } from "./helpers";
import { Badge } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TextBlockSection({ data, colors, ss, gs, ty }: SP) {
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const ta = ss?.textAlign ?? data.alignment ?? "left";
  const align = ta === "center" ? "text-center mx-auto" : ta === "right" ? "text-right ml-auto" : "";
  const defaultBg = data.bgColor === "secondary" ? colors.secondary : colors.background;
  const bgSty = { ...getSectionBg(ss, defaultBg), padding: getPad(ss, gs) };
  return (
    <section style={bgSty}>
      <div className={`max-w-4xl mx-auto px-6 ${align}`} style={{ padding: "0 24px" }}>
        <Badge label={data.label} colors={colors} co={co} />
        {data.title && <h2 className="text-4xl md:text-5xl tracking-tight mb-6"
          style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>{data.title}</h2>}
        {data.content && (
          <div className="text-lg leading-relaxed space-y-4" style={{ color: co?.text ?? colors.text, opacity: 0.7, fontFamily: bFont(ty) }}>
            {data.content.split("\n\n").map((p2: string, i: number) => <p key={i}>{p2}</p>)}
          </div>
        )}
        {data.ctaText && (
          <div className="mt-8">
            <a href={data.ctaLink || "#"} className="inline-block px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs) }}>{data.ctaText}</a>
          </div>
        )}
      </div>
    </section>
  );
}
