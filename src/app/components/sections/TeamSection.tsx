import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, getAnimClass, hFont, bFont } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TeamSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "cards";
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
            {(data.members ?? []).map((member: any, i: number) => (
              <div key={i} className={`flex items-center gap-6 p-6 ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.avatarUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
                    style={{ backgroundColor: p, color: "#fff" }}>{(member.name ?? "?").charAt(0)}</div>
                )}
                <div>
                  <h3 className="text-lg font-bold" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty) }}>{member.name}</h3>
                  <p className="text-sm font-medium" style={{ color: p }}>{member.role}</p>
                  {member.bio && <p className="text-sm mt-1" style={{ color: co?.text ?? colors.text, opacity: 0.6, fontFamily: bFont(ty) }}>{member.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const cols = data.columns === 2 ? "md:grid-cols-2" : data.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className={`grid gap-8 ${cols}`}>
          {(data.members ?? []).map((member: any, i: number) => (
            <div key={i} className={`p-8 text-center ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatarUrl} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: p, color: "#fff" }}>{(member.name ?? "?").charAt(0)}</div>
              )}
              <h3 className="text-lg font-bold" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty) }}>{member.name}</h3>
              <p className="text-sm font-medium mb-3" style={{ color: p }}>{member.role}</p>
              {member.bio && <p className="text-sm leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.6, fontFamily: bFont(ty) }}>{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
