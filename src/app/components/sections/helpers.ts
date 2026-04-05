import { CSSProperties } from "react";
import { SectionStyle, GlobalStyle, SiteContent, Typography } from "./types";

// ── Border Radius ──────────────────────────────────────────────────

const BR_MAP: Record<string, string> = { none: "0px", sm: "4px", md: "8px", lg: "16px", xl: "24px" };

export function getBR(ss?: SectionStyle, gs?: GlobalStyle): string {
  return BR_MAP[ss?.borderRadius ?? gs?.borderRadius ?? "md"] ?? "8px";
}

// ── Padding ────────────────────────────────────────────────────────

export function getPad(ss?: SectionStyle, gs?: GlobalStyle): string {
  const key = ss?.padding ?? (gs?.sectionSpacing === "compact" ? "sm" : gs?.sectionSpacing === "relaxed" ? "xl" : "lg");
  const map: Record<string, string> = { none: "0 0px", sm: "48px 24px", md: "80px 24px", lg: "112px 24px", xl: "160px 24px" };
  return map[key] ?? "112px 24px";
}

// ── Section Background ─────────────────────────────────────────────

export function getSectionBg(ss?: SectionStyle, defaultBg?: string): CSSProperties {
  if (!ss?.background) return defaultBg ? { backgroundColor: defaultBg } : {};
  const { type, value } = ss.background;
  if (type === "color") return { backgroundColor: value };
  if (type === "gradient") return { background: value };
  if (type === "image") return { backgroundImage: `url(${value})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" };
  return {};
}

// ── Card Style ─────────────────────────────────────────────────────

export function getCardSty(gs?: GlobalStyle, colors?: SiteContent["colors"], co?: SectionStyle["colorOverrides"]): CSSProperties {
  const cs = gs?.cardStyle ?? "elevated";
  const bg = co?.bg ?? colors?.secondary ?? "#111";
  const accent = co?.primary ?? colors?.primary ?? "#fff";
  switch (cs) {
    case "flat": return { backgroundColor: bg };
    case "bordered": return { backgroundColor: bg, border: `1px solid ${accent}30` };
    case "glass": return { backgroundColor: `${bg}99`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${accent}20` };
    case "elevated":
    default: return { backgroundColor: bg, boxShadow: "0 4px 24px rgba(0,0,0,0.25)", border: `1px solid ${accent}20` };
  }
}

// ── Max Width ──────────────────────────────────────────────────────

export function getMW(ss?: SectionStyle, gs?: GlobalStyle): string {
  const mw = ss?.maxWidth ?? gs?.maxWidth ?? "xl";
  const map: Record<string, string> = { sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-5xl", xl: "max-w-6xl", full: "max-w-full" };
  return map[mw] ?? "max-w-6xl";
}

// ── Animations ─────────────────────────────────────────────────────

export function getAnimClass(ss?: SectionStyle, gs?: GlobalStyle): string {
  if (ss?.animation === "none") return "";
  const a = ss?.animation ?? (gs?.animations ? "fadeIn" : undefined);
  return a ? `scroll-anim anim-${a}` : "scroll-anim";
}

// ── Font Config ────────────────────────────────────────────────────

export const FONTS: Record<string, { css: string; url?: string }> = {
  "Inter": { css: "'Inter', system-ui, sans-serif" },
  "Playfair Display": { css: "'Playfair Display', Georgia, serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" },
  "Oswald": { css: "'Oswald', sans-serif", url: "https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap" },
  "Montserrat": { css: "'Montserrat', sans-serif", url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" },
  "Space Grotesk": { css: "'Space Grotesk', sans-serif", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap" },
  "DM Sans": { css: "'DM Sans', sans-serif", url: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,700;9..40,800&display=swap" },
  "Bebas Neue": { css: "'Bebas Neue', sans-serif", url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" },
};

export function hFont(ty?: Typography): string { return FONTS[ty?.headingFont ?? "Inter"]?.css ?? FONTS["Inter"].css; }
export function bFont(ty?: Typography): string { return FONTS[ty?.bodyFont ?? "Inter"]?.css ?? FONTS["Inter"].css; }
export function hW(ty?: Typography): number { return ty?.headingWeight === "extrabold" ? 800 : ty?.headingWeight === "bold" ? 700 : 900; }
