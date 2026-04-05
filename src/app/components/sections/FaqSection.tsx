import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, getAnimClass, hFont, bFont } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function FaqSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "default";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.background), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  const items = data.items ?? [];

  if (layout === "two-column") {
    const half = Math.ceil(items.length / 2);
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          <div className="grid md:grid-cols-2 gap-6">
            {[items.slice(0, half), items.slice(half)].map((col, ci) => (
              <div key={ci} className="flex flex-col gap-4">
                {col.map((item: any, i: number) => (
                  <div key={i} className={`p-6 ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: p, fontFamily: hFont(ty) }}>{item.question}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.7, fontFamily: bFont(ty) }}>{item.answer}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={bgSty}>
      <div className={`max-w-4xl mx-auto`} style={{ padding: "0 24px" }}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className="flex flex-col gap-4">
          {items.map((item: any, i: number) => (
            <div key={i} className={`p-6 ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: p, fontFamily: hFont(ty) }}>{item.question}</h3>
              <p className="text-sm leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.7, fontFamily: bFont(ty) }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
