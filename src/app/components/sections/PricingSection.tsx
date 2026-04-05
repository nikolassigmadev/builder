import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, getAnimClass, hFont, bFont, hW } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function PricingSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "cards";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.background), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  if (layout === "table") {
    const allFeatures = [...new Set((data.plans ?? []).flatMap((pl: any) => pl.features ?? []))];
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left text-sm font-bold uppercase tracking-wider" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>Feature</th>
                  {(data.plans ?? []).map((pl: any) => (
                    <th key={pl.name} className="p-4 text-center" style={{ backgroundColor: pl.popular ? p : "transparent", borderRadius: getBR(ss, gs) }}>
                      <div className="text-sm font-black uppercase" style={{ color: pl.popular ? "#fff" : co?.text ?? colors.text }}>{pl.name}</div>
                      <div className="text-2xl font-black mt-1" style={{ color: pl.popular ? "#fff" : p }}>{pl.price}</div>
                      <div className="text-xs opacity-70" style={{ color: pl.popular ? "#fff" : co?.text ?? colors.text }}>{pl.period}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((f: any) => (
                  <tr key={f} style={{ borderBottom: `1px solid ${p}15` }}>
                    <td className="p-4 text-sm" style={{ color: co?.text ?? colors.text, opacity: 0.7 }}>{f}</td>
                    {(data.plans ?? []).map((pl: any) => (
                      <td key={pl.name} className="p-4 text-center">
                        {(pl.features ?? []).includes(f)
                          ? <span className="text-base" style={{ color: p }}>&#10003;</span>
                          : <span className="text-base opacity-25" style={{ color: co?.text ?? colors.text }}>&ndash;</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  // Default: cards
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {(data.plans ?? []).map((plan: any) => (
            <div key={plan.name} className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${animClass}`}
              style={plan.popular
                ? { backgroundColor: p, boxShadow: `0 20px 60px ${p}50`, transform: "scale(1.05)", borderRadius: getBR(ss, gs) }
                : { ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              {plan.popular && (
                <div className="text-center py-2 text-xs font-black uppercase tracking-[0.2em]"
                  style={{ backgroundColor: co?.accent ?? colors.accent, color: colors.secondary }}>Most Popular</div>
              )}
              <div className="p-8">
                <h3 className="text-lg font-bold uppercase tracking-wider mb-4"
                  style={{ color: plan.popular ? "#fff" : co?.text ?? colors.text, fontFamily: hFont(ty) }}>{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-black tracking-tight" style={{ color: plan.popular ? "#fff" : p, fontFamily: hFont(ty) }}>{plan.price}</span>
                  <span className="text-sm ml-2" style={{ color: plan.popular ? "rgba(255,255,255,0.65)" : co?.text ?? colors.text, opacity: plan.popular ? 1 : 0.5 }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {(plan.features ?? []).map((f: string) => (
                    <li key={f} className="flex items-center gap-3 text-sm" style={{ color: plan.popular ? "rgba(255,255,255,0.9)" : co?.text ?? colors.text }}>
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: plan.popular ? "rgba(255,255,255,0.2)" : `${p}25`, color: plan.popular ? "#fff" : p }}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={plan.ctaLink || "#contact"} className="block w-full text-center py-3 font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:brightness-110"
                  style={plan.popular
                    ? { backgroundColor: "#fff", color: p, borderRadius: getBR(ss, gs) }
                    : { backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs) }}>
                  {plan.ctaText || "Get Started"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
