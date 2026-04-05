import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, getAnimClass, hFont, bFont } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function FeaturesSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "grid";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.secondary), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  if (layout === "alternating") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          <div className="flex flex-col gap-16">
            {(data.items ?? []).map((item: any, i: number) => (
              <div key={i} className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""} ${animClass}`}>
                <div className="flex items-center justify-center p-12" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                  <span className="text-7xl">{item.icon ?? "\u26a1"}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty) }}>{item.title}</h3>
                  <p className="text-lg leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.65, fontFamily: bFont(ty) }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "icon-list") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          <div className="grid md:grid-cols-2 gap-4">
            {(data.items ?? []).map((item: any, i: number) => (
              <div key={i} className={`flex items-center gap-4 p-5 ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${p}15` }}>{item.icon ?? "\u2713"}</div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty) }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: co?.text ?? colors.text, opacity: 0.6, fontFamily: bFont(ty) }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default: grid
  const cols = data.columns === 2 ? "md:grid-cols-2" : data.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className={`grid gap-8 ${cols}`}>
          {(data.items ?? []).map((item: any, i: number) => (
            <div key={i} className={`p-8 text-center ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              {item.icon && <span className="text-4xl mb-4 block">{item.icon}</span>}
              <h3 className="text-xl font-bold mb-3" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty) }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.6, fontFamily: bFont(ty) }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
