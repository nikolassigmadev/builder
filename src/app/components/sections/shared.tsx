import { SectionStyle, SiteContent, Typography } from "./types";
import { getBR, hFont, bFont, hW } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function Badge({ label, colors, co }: { label?: string; colors: SiteContent["colors"]; co?: SectionStyle["colorOverrides"] }) {
  if (!label) return null;
  const p = co?.primary ?? colors.primary;
  return (
    <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded"
      style={{ backgroundColor: `${p}15`, color: p }}>{label}</span>
  );
}

export function SectionHeader({ data, colors, ty, ss, center = true }: { data: any; colors: SiteContent["colors"]; ty?: Typography; ss?: SectionStyle; center?: boolean }) {
  const co = ss?.colorOverrides;
  const ta = ss?.textAlign ?? (center ? "center" : "left");
  const align = ta === "center" ? "text-center" : ta === "right" ? "text-right" : "";
  return (
    <div className={`mb-16 ${align}`}>
      <Badge label={data.label} colors={colors} co={co} />
      <h2 className="text-4xl md:text-5xl tracking-tight" style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>{data.title}</h2>
      {data.subtitle && <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: co?.text ?? colors.text, opacity: 0.6, fontFamily: bFont(ty) }}>{data.subtitle}</p>}
    </div>
  );
}

export function CTAButton({ text, link, primary, colors, ss }: { text?: string; link?: string; primary?: boolean; colors: SiteContent["colors"]; ss?: SectionStyle }) {
  if (!text) return null;
  const p = ss?.colorOverrides?.primary ?? colors.primary;
  return (
    <a href={link || "#"} className="inline-block px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
      style={primary
        ? { backgroundColor: p, color: "#fff", boxShadow: `0 8px 32px ${p}40`, borderRadius: getBR(ss) }
        : { border: `2px solid ${p}`, color: p, borderRadius: getBR(ss) }}>
      {text}
    </a>
  );
}
