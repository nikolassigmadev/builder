import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, getAnimClass, hFont, bFont } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function ClassesSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "grid";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.secondary), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  if (layout === "list") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          <div className="flex flex-col gap-4">
            {(data.items ?? []).map((cls: any) => (
              <div key={cls.name} className={`flex items-center gap-6 p-6 ${animClass}`}
                style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                <span className="text-4xl flex-shrink-0">{cls.icon ?? "\ud83c\udfcb\ufe0f"}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty) }}>{cls.name}</h3>
                  <p className="text-sm" style={{ color: co?.text ?? colors.text, opacity: 0.6 }}>{cls.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {cls.days && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${p}18`, color: co?.accent ?? colors.accent }}>{cls.days}</span>}
                  {cls.time && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${p}18`, color: co?.accent ?? colors.accent }}>{cls.time}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const cols = layout === "cards" ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className={`grid ${cols} gap-6`}>
          {(data.items ?? []).map((cls: any) => (
            <div key={cls.name} className={`group relative p-8 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden ${animClass}`}
              style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: p }} />
              <div className="flex items-start gap-4">
                <span className="text-4xl leading-none">{cls.icon ?? "\ud83c\udfcb\ufe0f"}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty) }}>{cls.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cls.days && <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${p}18`, color: co?.accent ?? colors.accent }}>{cls.days}</span>}
                    {cls.time && <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${p}18`, color: co?.accent ?? colors.accent }}>{cls.time}</span>}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.6 }}>{cls.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
