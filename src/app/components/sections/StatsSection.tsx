import { SP } from "./types";
import { getMW, getPad, getSectionBg, getAnimClass, hFont, hW } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function StatsSection({ data, colors, ss, gs, ty }: SP) {
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.secondary), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);
  const cols = data.columns === 2 ? "grid-cols-2" : data.columns === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4";
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl tracking-tight" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>{data.title}</h2>
          </div>
        )}
        <div className={`grid gap-8 ${cols}`}>
          {(data.items ?? []).map((stat: any, i: number) => (
            <div key={i} className={`text-center p-6 ${animClass}`}>
              <span className="text-4xl md:text-5xl font-black tracking-tight block mb-2"
                style={{ color: p, fontFamily: hFont(ty) }}>{stat.value}</span>
              <span className="text-sm uppercase tracking-widest" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
