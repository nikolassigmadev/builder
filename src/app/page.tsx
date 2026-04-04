import fs from "fs";
import path from "path";
import Link from "next/link";
import { CSSProperties } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Types ──────────────────────────────────────────────────────────

type SectionStyle = {
  layout?: string;
  background?: { type: "color" | "gradient" | "image"; value: string };
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  textAlign?: "left" | "center" | "right";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  shadow?: "none" | "sm" | "md" | "lg";
  animation?: "none" | "fadeIn" | "slideUp" | "slideLeft";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  colorOverrides?: { bg?: string; text?: string; accent?: string; primary?: string };
  customCSS?: string;
};

type Section = {
  id: string;
  type: string;
  visible: boolean;
  style?: SectionStyle;
  data: any;
};

type Typography = {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: "bold" | "extrabold" | "black";
  baseSize?: "sm" | "md" | "lg";
};

type GlobalStyle = {
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  cardStyle?: "flat" | "elevated" | "bordered" | "glass";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  sectionSpacing?: "compact" | "normal" | "relaxed";
  animations?: boolean;
  navStyle?: "solid" | "transparent" | "floating";
};

type FooterColumn =
  | { type: "brand"; logo?: string; logoImageUrl?: string; tagline?: string }
  | { type: "links"; title?: string; links: { label: string; href: string }[] }
  | { type: "social"; title?: string; socialLinks: { platform: string; icon: string; href: string }[] }
  | { type: "text"; title?: string; text: string }
  | { type: "contact"; title?: string; phone?: string; email?: string; address?: string };

type SiteContent = {
  siteTitle: string;
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
  nav: {
    ctaText: string;
    ctaLink: string;
    logoText?: string;
    logoImageUrl?: string;
    links?: { label: string; href: string }[];
    layout?: "default" | "centered" | "minimal";
  };
  footer: {
    tagline?: string;
    socialLinks?: string[];
    layout?: "three-column" | "two-column" | "centered" | "minimal";
    backgroundColor?: string;
    columns?: FooterColumn[];
    copyright?: string;
    customCSS?: string;
  };
  typography?: Typography;
  globalStyle?: GlobalStyle;
  globalCSS?: string;
  sections: Section[];
};

// Shorthand section props
type SP = {
  data: any;
  colors: SiteContent["colors"];
  ss?: SectionStyle;
  gs?: GlobalStyle;
  ty?: Typography;
};

// ── Content Loading ────────────────────────────────────────────────

export const dynamic = "force-dynamic";

const DEFAULT_CONTENT: SiteContent = {
  siteTitle: "Iron Forge Gym",
  colors: { primary: "#16a34a", secondary: "#052e16", accent: "#86efac", background: "#030d06", text: "#f0fdf4" },
  nav: { ctaText: "Join Now", ctaLink: "#contact" },
  footer: { tagline: "New York's premier fitness destination.", socialLinks: ["IG", "FB", "TW", "YT"] },
  sections: [],
};

function getContent(): SiteContent {
  try {
    const projectPath = path.join(process.cwd(), "content", "current.json");
    const tmpPath = "/tmp/content/current.json";
    try {
      fs.accessSync(path.dirname(projectPath), fs.constants.W_OK);
      return JSON.parse(fs.readFileSync(projectPath, "utf-8"));
    } catch {
      if (fs.existsSync(tmpPath)) return JSON.parse(fs.readFileSync(tmpPath, "utf-8"));
      return JSON.parse(fs.readFileSync(projectPath, "utf-8"));
    }
  } catch {
    return DEFAULT_CONTENT;
  }
}

// ── Style Helpers ──────────────────────────────────────────────────

const BR_MAP: Record<string, string> = { none: "0px", sm: "4px", md: "8px", lg: "16px", xl: "24px" };
function getBR(ss?: SectionStyle, gs?: GlobalStyle): string {
  return BR_MAP[ss?.borderRadius ?? gs?.borderRadius ?? "md"] ?? "8px";
}

function getPad(ss?: SectionStyle, gs?: GlobalStyle): string {
  const key = ss?.padding ?? (gs?.sectionSpacing === "compact" ? "sm" : gs?.sectionSpacing === "relaxed" ? "xl" : "lg");
  const map: Record<string, string> = { none: "0 0px", sm: "48px 24px", md: "80px 24px", lg: "112px 24px", xl: "160px 24px" };
  return map[key] ?? "112px 24px";
}

function getSectionBg(ss?: SectionStyle, defaultBg?: string): CSSProperties {
  if (!ss?.background) return defaultBg ? { backgroundColor: defaultBg } : {};
  const { type, value } = ss.background;
  if (type === "color") return { backgroundColor: value };
  if (type === "gradient") return { background: value };
  if (type === "image") return { backgroundImage: `url(${value})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" };
  return {};
}

function getCardSty(gs?: GlobalStyle, colors?: SiteContent["colors"], co?: SectionStyle["colorOverrides"]): CSSProperties {
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

function getMW(ss?: SectionStyle, gs?: GlobalStyle): string {
  const mw = ss?.maxWidth ?? gs?.maxWidth ?? "xl";
  const map: Record<string, string> = { sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-5xl", xl: "max-w-6xl", full: "max-w-full" };
  return map[mw] ?? "max-w-6xl";
}

function getAnimClass(ss?: SectionStyle, gs?: GlobalStyle): string {
  if (ss?.animation === "none") return "";
  const a = ss?.animation ?? (gs?.animations ? "fadeIn" : undefined);
  return a ? `scroll-anim anim-${a}` : "scroll-anim";
}

// ── Font Config ────────────────────────────────────────────────────

const FONTS: Record<string, { css: string; url?: string }> = {
  "Inter": { css: "'Inter', system-ui, sans-serif" },
  "Playfair Display": { css: "'Playfair Display', Georgia, serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" },
  "Oswald": { css: "'Oswald', sans-serif", url: "https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap" },
  "Montserrat": { css: "'Montserrat', sans-serif", url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" },
  "Space Grotesk": { css: "'Space Grotesk', sans-serif", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap" },
  "DM Sans": { css: "'DM Sans', sans-serif", url: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,700;9..40,800&display=swap" },
  "Bebas Neue": { css: "'Bebas Neue', sans-serif", url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" },
};

function hFont(ty?: Typography): string { return FONTS[ty?.headingFont ?? "Inter"]?.css ?? FONTS["Inter"].css; }
function bFont(ty?: Typography): string { return FONTS[ty?.bodyFont ?? "Inter"]?.css ?? FONTS["Inter"].css; }
function hW(ty?: Typography): number { return ty?.headingWeight === "extrabold" ? 800 : ty?.headingWeight === "bold" ? 700 : 900; }

// ── Shared UI Components ───────────────────────────────────────────

function Badge({ label, colors, co }: { label?: string; colors: SiteContent["colors"]; co?: SectionStyle["colorOverrides"] }) {
  if (!label) return null;
  const p = co?.primary ?? colors.primary;
  return (
    <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded"
      style={{ backgroundColor: `${p}15`, color: p }}>{label}</span>
  );
}

function SectionHeader({ data, colors, ty, ss, center = true }: { data: any; colors: SiteContent["colors"]; ty?: Typography; ss?: SectionStyle; center?: boolean }) {
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

function CTAButton({ text, link, primary, colors, ss }: { text?: string; link?: string; primary?: boolean; colors: SiteContent["colors"]; ss?: SectionStyle }) {
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

// ── Hero Section ───────────────────────────────────────────────────

function HeroSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "centered";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bg = getSectionBg(ss, undefined);
  const defaultBg = { background: `radial-gradient(ellipse at 50% 0%, ${colors.secondary} 0%, ${colors.background} 65%)` };
  const sectionBg = bg.backgroundColor || bg.backgroundImage ? bg : defaultBg;
  const animClass = getAnimClass(ss, gs);

  if (layout === "split") {
    return (
      <section className="relative min-h-screen flex items-center px-6 pt-20" style={sectionBg}>
        <div className={`${getMW(ss, gs)} mx-auto grid md:grid-cols-2 gap-16 items-center w-full`}>
          <div className={animClass}>
            {data.badge && (
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full"
                style={{ backgroundColor: `${p}20`, color: co?.accent ?? colors.accent, border: `1px solid ${p}40` }}>{data.badge}</span>
            )}
            <h1 className="text-5xl md:text-7xl tracking-tighter leading-none mb-6"
              style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>
              {data.headline}
            </h1>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.7, fontFamily: bFont(ty) }}>{data.subheadline}</p>
            <div className="flex flex-wrap gap-4">
              {data.ctaText && (
                <a href={data.ctaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs), boxShadow: `0 8px 32px ${p}40` }}>{data.ctaText}</a>
              )}
              {data.secondaryCtaText && (
                <a href={data.secondaryCtaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
                  style={{ border: `2px solid ${p}`, color: co?.accent ?? colors.accent, borderRadius: getBR(ss, gs) }}>{data.secondaryCtaText}</a>
              )}
            </div>
          </div>
          <div className="relative">
            {data.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageUrl} alt={data.headline} className="w-full h-full object-cover"
                style={{ borderRadius: getBR(ss, gs), boxShadow: `0 20px 80px ${p}30` }} />
            ) : (
              <div className="aspect-square rounded-2xl flex items-center justify-center text-8xl"
                style={{ background: `radial-gradient(ellipse, ${p}25 0%, ${colors.secondary} 100%)`, border: `1px solid ${p}30`, borderRadius: getBR(ss, gs) }}>
                {data.heroIcon ?? "💪"}
              </div>
            )}
            {data.stats && data.stats.length > 0 && (
              <div className="absolute -bottom-6 -left-6 grid grid-cols-2 gap-px overflow-hidden"
                style={{ borderRadius: getBR(ss, gs), border: `1px solid ${p}20`, backgroundColor: `${p}10` }}>
                {data.stats.slice(0, 2).map((s: any) => (
                  <div key={s.label} className="px-5 py-4" style={{ backgroundColor: `${colors.background}ee` }}>
                    <span className="text-xl font-black block" style={{ color: p }}>{s.value}</span>
                    <span className="text-xs uppercase tracking-widest" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "minimal") {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20"
        style={Object.keys(sectionBg).length > 0 ? sectionBg : { backgroundColor: colors.background }}>
        <div className={`${getMW(ss, gs)} mx-auto text-center ${animClass}`}>
          {data.badge && (
            <span className="inline-block text-xs font-medium uppercase tracking-[0.4em] mb-8"
              style={{ color: p }}>{data.badge}</span>
          )}
          <h1 className="text-7xl md:text-9xl tracking-tighter leading-none mb-8"
            style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>
            {data.headline}
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-xl mx-auto" style={{ color: co?.text ?? colors.text, opacity: 0.55, fontFamily: bFont(ty) }}>{data.subheadline}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {data.ctaText && (
              <a href={data.ctaLink || "#"} className="px-10 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:-translate-y-1"
                style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs) }}>{data.ctaText}</a>
            )}
            {data.secondaryCtaText && (
              <a href={data.secondaryCtaLink || "#"} className="px-10 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:-translate-y-1"
                style={{ border: `1px solid ${co?.text ?? colors.text}30`, color: co?.text ?? colors.text, borderRadius: getBR(ss, gs) }}>{data.secondaryCtaText}</a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default: centered
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20" style={sectionBg}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${p}20 0%, transparent 70%)`, filter: "blur(40px)" }} />
      {data.imageUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.imageUrl} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${colors.background}80 0%, ${colors.background} 100%)` }} />
        </div>
      )}
      <div className={`relative z-10 ${getMW(ss, gs)} mx-auto ${animClass}`}>
        {data.badge && (
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: `${p}20`, color: co?.accent ?? colors.accent, border: `1px solid ${p}40` }}>{data.badge}</span>
        )}
        <h1 className="text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none mb-6"
          style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>
          {(data.headline ?? "").split(" ").map((word: string, i: number, arr: string[]) => (
            <span key={i}>{i === 1 ? <span style={{ color: p }}>{word}</span> : word}{i < arr.length - 1 ? " " : ""}</span>
          ))}
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: co?.text ?? colors.text, opacity: 0.7, fontFamily: bFont(ty) }}>{data.subheadline}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {data.ctaText && (
            <a href={data.ctaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs), boxShadow: `0 8px 32px ${p}40` }}>{data.ctaText}</a>
          )}
          {data.secondaryCtaText && (
            <a href={data.secondaryCtaLink || "#"} className="px-8 py-4 text-base font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: `2px solid ${p}`, color: co?.accent ?? colors.accent, borderRadius: getBR(ss, gs) }}>{data.secondaryCtaText}</a>
          )}
        </div>
        {data.stats && data.stats.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden"
            style={{ border: `1px solid ${p}20`, backgroundColor: `${p}10`, borderRadius: getBR(ss, gs) }}>
            {data.stats.map((stat: any) => (
              <div key={stat.label} className="flex flex-col items-center justify-center py-6 px-4" style={{ backgroundColor: `${colors.background}cc` }}>
                <span className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: p }}>{stat.value}</span>
                <span className="text-xs uppercase tracking-widest mt-1" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: co?.text ?? colors.text, opacity: 0.35 }}>Scroll</span>
        <div className="w-px h-12" style={{ background: `linear-gradient(to bottom, ${p}80, transparent)` }} />
      </div>
    </section>
  );
}

// ── About Section ──────────────────────────────────────────────────

function AboutSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "split";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.background), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  const textBlock = (
    <div className={animClass}>
      <Badge label={data.label} colors={colors} co={co} />
      <h2 className="text-4xl md:text-5xl tracking-tight mb-6 leading-tight"
        style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>{data.title}</h2>
      <p className="text-lg leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.65, fontFamily: bFont(ty) }}>{data.description}</p>
      {data.ctaText && (
        <a href={data.ctaLink || "#"} className="inline-block mt-8 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs) }}>{data.ctaText}</a>
      )}
    </div>
  );

  const statsBlock = data.stats && data.stats.length > 0 && (
    <div className={`grid grid-cols-2 gap-4 ${animClass}`}>
      {data.stats.map((stat: any) => (
        <div key={stat.label} className="p-6 flex flex-col gap-2" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
          <span className="text-3xl font-black tracking-tight" style={{ color: p, fontFamily: hFont(ty) }}>{stat.value}</span>
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: co?.text ?? colors.text, opacity: 0.55 }}>{stat.label}</span>
        </div>
      ))}
    </div>
  );

  if (layout === "centered") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto text-center`}>
          <Badge label={data.label} colors={colors} co={co} />
          <h2 className="text-4xl md:text-5xl tracking-tight mb-6"
            style={{ color: co?.text ?? colors.text, fontFamily: hFont(ty), fontWeight: hW(ty) }}>{data.title}</h2>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-12" style={{ color: co?.text ?? colors.text, opacity: 0.65 }}>{data.description}</p>
          {data.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.stats.map((stat: any) => (
                <div key={stat.label} className="p-6 text-center" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                  <span className="text-3xl font-black block" style={{ color: p }}>{stat.value}</span>
                  <span className="text-sm uppercase tracking-wider mt-1 block" style={{ color: co?.text ?? colors.text, opacity: 0.55 }}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          {data.ctaText && <div className="mt-8"><CTAButton text={data.ctaText} link={data.ctaLink} primary colors={colors} ss={ss} /></div>}
        </div>
      </section>
    );
  }

  if (layout === "stacked") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <div className="mb-12">{textBlock}</div>
          {statsBlock && <div className={`grid grid-cols-2 md:grid-cols-${Math.min(data.stats?.length ?? 4, 4)} gap-4`}>{data.stats?.map((stat: any) => (
            <div key={stat.label} className="p-6 text-center" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              <span className="text-3xl font-black block" style={{ color: p }}>{stat.value}</span>
              <span className="text-sm uppercase tracking-wider mt-1 block" style={{ color: co?.text ?? colors.text, opacity: 0.55 }}>{stat.label}</span>
            </div>
          ))}</div>}
        </div>
      </section>
    );
  }

  // Default: split
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto grid md:grid-cols-2 gap-16 items-center`}>
        {textBlock}
        {statsBlock}
      </div>
    </section>
  );
}

// ── Classes Section ────────────────────────────────────────────────

function ClassesSection({ data, colors, ss, gs, ty }: SP) {
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
                <span className="text-4xl flex-shrink-0">{cls.icon ?? "🏋️"}</span>
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
                <span className="text-4xl leading-none">{cls.icon ?? "🏋️"}</span>
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

// ── Pricing Section ────────────────────────────────────────────────

function PricingSection({ data, colors, ss, gs, ty }: SP) {
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
                          ? <span className="text-base" style={{ color: p }}>✓</span>
                          : <span className="text-base opacity-25" style={{ color: co?.text ?? colors.text }}>–</span>}
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
                        style={{ backgroundColor: plan.popular ? "rgba(255,255,255,0.2)" : `${p}25`, color: plan.popular ? "#fff" : p }}>✓</span>
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

// ── Testimonials Section ───────────────────────────────────────────

function TestimonialsSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "cards";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.secondary), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);

  const TestimonialCard = ({ t }: { t: any }) => (
    <div className={`p-8 flex flex-col gap-6 ${animClass}`} style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
      <div className="flex gap-1" aria-label="5 stars">{[...Array(t.rating ?? 5)].map((_, i) => <span key={i} style={{ color: p }}>★</span>)}</div>
      <div className="relative">
        <span className="absolute -top-2 -left-1 text-5xl leading-none font-serif select-none" style={{ color: p, opacity: 0.3 }} aria-hidden="true">&ldquo;</span>
        <p className="text-base leading-relaxed pl-5 pt-2 italic" style={{ color: co?.text ?? colors.text, opacity: 0.8, fontFamily: bFont(ty) }}>{t.text}</p>
      </div>
      <div className="flex items-center gap-3 mt-auto">
        {t.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ backgroundColor: p, color: "#fff" }}>{(t.name ?? "?").charAt(0)}</div>
        )}
        <div>
          <p className="font-bold text-sm" style={{ color: co?.text ?? colors.text, fontFamily: bFont(ty) }}>{t.name}</p>
          <p className="text-xs" style={{ color: co?.text ?? colors.text, opacity: 0.45 }}>{t.role}</p>
        </div>
      </div>
    </div>
  );

  if (layout === "large") {
    const [featured, ...rest] = data.items ?? [];
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          {featured && (
            <div className="mb-8 p-12 relative overflow-hidden" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
              <span className="absolute top-6 left-8 text-[120px] leading-none font-serif opacity-10 select-none" style={{ color: p }}>&ldquo;</span>
              <div className="flex gap-1 mb-6">{[...Array(featured.rating ?? 5)].map((_, i) => <span key={i} style={{ color: p }}>★</span>)}</div>
              <p className="text-2xl md:text-3xl leading-relaxed italic mb-8" style={{ color: co?.text ?? colors.text, fontFamily: bFont(ty) }}>{featured.text}</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black" style={{ backgroundColor: p, color: "#fff" }}>{(featured.name ?? "?").charAt(0)}</div>
                <div>
                  <p className="font-bold" style={{ color: co?.text ?? colors.text }}>{featured.name}</p>
                  <p className="text-sm" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{featured.role}</p>
                </div>
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">{rest.map((t: any) => <TestimonialCard key={t.name} t={t} />)}</div>
          )}
        </div>
      </section>
    );
  }

  // Default: 3-col cards
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className={`grid gap-6 ${(data.items ?? []).length === 2 ? "md:grid-cols-2" : (data.items ?? []).length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
          {(data.items ?? []).map((t: any) => <TestimonialCard key={t.name} t={t} />)}
        </div>
      </div>
    </section>
  );
}

// ── Contact Section ────────────────────────────────────────────────

function ContactSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "side-by-side";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.background), padding: getPad(ss, gs) };

  const infoItems = [
    { icon: "📍", label: "Address", value: data.address },
    { icon: "📞", label: "Phone", value: data.phone },
    { icon: "✉️", label: "Email", value: data.email },
    { icon: "🕐", label: "Hours", value: data.hours },
  ].filter(i => i.value);

  const formEl = (
    <form className="p-8 flex flex-col gap-5" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
      {(data.formFields ?? [
        { name: "name", label: "Name", type: "text", placeholder: "Your full name" },
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name: "message", label: "Message", type: "textarea", placeholder: "Tell us about your goals..." },
      ]).map((field: any) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: p }}>{field.label}</label>
          {field.type === "textarea" ? (
            <textarea name={field.name} rows={5} placeholder={field.placeholder} className="px-4 py-3 text-sm outline-none resize-none"
              style={{ backgroundColor: colors.background, border: `1px solid ${p}30`, color: co?.text ?? colors.text, borderRadius: getBR(ss, gs) }} />
          ) : (
            <input type={field.type || "text"} name={field.name} placeholder={field.placeholder} className="px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: colors.background, border: `1px solid ${p}30`, color: co?.text ?? colors.text, borderRadius: getBR(ss, gs) }} />
          )}
        </div>
      ))}
      <button type="submit" className="py-3 font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
        style={{ backgroundColor: p, color: "#fff", borderRadius: getBR(ss, gs) }}>{data.submitText ?? "Send Message"}</button>
    </form>
  );

  if (layout === "stacked") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto max-w-2xl`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          {infoItems.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {infoItems.map(item => (
                <div key={item.label} className="flex items-start gap-3 p-4" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: p }}>{item.label}</p>
                    <p className="text-sm" style={{ color: co?.text ?? colors.text, opacity: 0.75 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {formEl}
        </div>
      </section>
    );
  }

  if (layout === "minimal") {
    return (
      <section style={bgSty}>
        <div className={`${getMW(ss, gs)} mx-auto max-w-xl`}>
          <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
          {formEl}
        </div>
      </section>
    );
  }

  // Default: side-by-side
  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-6">
            {infoItems.map(item => (
              <div key={item.label} className="flex items-start gap-4 p-5" style={{ ...getCardSty(gs, colors, co), borderRadius: getBR(ss, gs) }}>
                <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: p }}>{item.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: co?.text ?? colors.text, opacity: 0.75 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          {formEl}
        </div>
      </div>
    </section>
  );
}

// ── Features Section ───────────────────────────────────────────────

function FeaturesSection({ data, colors, ss, gs, ty }: SP) {
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
                  <span className="text-7xl">{item.icon ?? "⚡"}</span>
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
                  style={{ backgroundColor: `${p}15` }}>{item.icon ?? "✓"}</div>
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

// ── FAQ Section ────────────────────────────────────────────────────

function FaqSection({ data, colors, ss, gs, ty }: SP) {
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

// ── CTA Banner Section ─────────────────────────────────────────────

function CtaBannerSection({ data, colors, ss, gs, ty }: SP) {
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

// ── Team Section ───────────────────────────────────────────────────

function TeamSection({ data, colors, ss, gs, ty }: SP) {
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

// ── Text Block Section ─────────────────────────────────────────────

function TextBlockSection({ data, colors, ss, gs, ty }: SP) {
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

// ── Stats Section ──────────────────────────────────────────────────

function StatsSection({ data, colors, ss, gs, ty }: SP) {
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

// ── Gallery Section ────────────────────────────────────────────────

function GallerySection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "grid";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.background), padding: getPad(ss, gs) };
  const animClass = getAnimClass(ss, gs);
  const cols = data.columns === 2 ? "md:grid-cols-2" : data.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  const heights = ["aspect-video", "aspect-square", "aspect-[4/3]", "aspect-video", "aspect-square", "aspect-[3/4]"];

  return (
    <section style={bgSty}>
      <div className={`${getMW(ss, gs)} mx-auto`}>
        <SectionHeader data={data} colors={colors} ty={ty} ss={ss} />
        <div className={`grid gap-4 ${cols}`}>
          {(data.items ?? []).map((item: any, i: number) => (
            <div key={i} className={`${layout === "masonry" ? heights[i % heights.length] : "aspect-video"} overflow-hidden ${animClass}`}
              style={{ borderRadius: getBR(ss, gs), backgroundColor: co?.bg ?? colors.secondary, border: `1px solid ${p}15` }}>
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.caption || ""} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              ) : item.videoUrl ? (
                <iframe src={item.videoUrl} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <span className="text-4xl block mb-2">{item.icon ?? "📷"}</span>
                    {item.caption && <p className="text-sm" style={{ color: co?.text ?? colors.text, opacity: 0.5 }}>{item.caption}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section Router ─────────────────────────────────────────────────

function RenderSection({ section, colors, gs, ty }: {
  section: Section; colors: SiteContent["colors"]; gs?: GlobalStyle; ty?: Typography;
}) {
  if (!section.visible) return null;
  const props = { data: section.data, colors, ss: section.style, gs, ty };
  switch (section.type) {
    case "hero": return <HeroSection {...props} />;
    case "about": return <AboutSection {...props} />;
    case "classes": return <ClassesSection {...props} />;
    case "pricing": return <PricingSection {...props} />;
    case "testimonials": return <TestimonialsSection {...props} />;
    case "contact": return <ContactSection {...props} />;
    case "features": return <FeaturesSection {...props} />;
    case "faq": return <FaqSection {...props} />;
    case "cta_banner": return <CtaBannerSection {...props} />;
    case "team": return <TeamSection {...props} />;
    case "text_block": return <TextBlockSection {...props} />;
    case "stats": return <StatsSection {...props} />;
    case "gallery": return <GallerySection {...props} />;
    default: return null;
  }
}

// ── Main Page ──────────────────────────────────────────────────────

export default function Home() {
  const content = getContent();
  const { colors, sections, typography, globalStyle, globalCSS } = content;
  const gs = globalStyle ?? {};
  const ty = typography ?? {};

  const navStyle = gs.navStyle ?? "solid";
  const bodyFontCss = bFont(ty);
  const headingFontCss = hFont(ty);

  // Collect font URLs to load
  const fontUrls = [...new Set([
    FONTS[ty.headingFont ?? ""]?.url,
    FONTS[ty.bodyFont ?? ""]?.url,
  ].filter(Boolean))] as string[];

  // Build per-section custom CSS + global CSS
  const allCustomCSS = [
    globalCSS ?? "",
    ...(sections ?? []).filter(s => s.style?.customCSS).map(s => `#${s.id} { ${s.style!.customCSS} }`),
  ].join("\n");

  // Animation CSS — pure CSS, no JS, no hydration mismatch
  const animationCSS = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    .scroll-anim { animation: fadeIn 0.6s ease both; }
    .anim-fadeIn { animation: fadeIn 0.6s ease both; }
    .anim-slideUp { animation: slideUp 0.7s ease both; }
    .anim-slideLeft { animation: slideLeft 0.6s ease both; }
  `;

  const navSections = (sections ?? []).filter(s => s.visible && s.id && !["hero", "cta_banner"].includes(s.type));

  const navBg = navStyle === "transparent"
    ? { backgroundColor: "transparent" }
    : navStyle === "floating"
    ? { backgroundColor: `${colors.background}cc`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "none", margin: "12px 16px", borderRadius: getBR(undefined, gs), border: `1px solid ${colors.primary}22` }
    : { backgroundColor: `${colors.background}d9`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${colors.primary}22` };

  return (
    <main style={{ backgroundColor: colors.background, color: colors.text, fontFamily: bodyFontCss }}>
      {/* Font imports */}
      {fontUrls.map(url => <link key={url} rel="stylesheet" href={url} />)}

      {/* Injected CSS */}
      <style dangerouslySetInnerHTML={{ __html: animationCSS + "\n" + allCustomCSS }} />

      {/* Navigation */}
      <nav className="fixed z-50 top-0 left-0 right-0 px-6 py-4" style={navBg}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          {content.nav?.logoImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.nav.logoImageUrl} alt={content.nav?.logoText ?? content.siteTitle} className="h-8 object-contain" />
          ) : (
            <span className="text-xl tracking-tighter" style={{ color: colors.primary, fontFamily: headingFontCss, fontWeight: hW(ty) }}>
              {content.nav?.logoText ?? content.siteTitle}
            </span>
          )}
          {/* Nav links — custom array or auto-generated from sections */}
          <div className="hidden md:flex items-center gap-8">
            {(content.nav?.links
              ? content.nav.links
              : navSections.map(s => ({ label: s.data?.title || s.id, href: `#${s.id}` }))
            ).map((link: { label: string; href: string }) => (
              <a key={link.href} href={link.href} className="text-sm font-medium uppercase tracking-widest transition-opacity duration-150 hover:opacity-100"
                style={{ color: colors.text, opacity: 0.65 }}>{link.label}</a>
            ))}
          </div>
          {content.nav?.ctaText && (
            <a href={content.nav.ctaLink || "#"} className="px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-150 hover:brightness-110"
              style={{ backgroundColor: colors.primary, color: "#fff", borderRadius: getBR(undefined, gs) }}>
              {content.nav.ctaText}
            </a>
          )}
        </div>
      </nav>

      {/* Sections */}
      {(sections ?? []).map(section => (
        <div key={section.id} id={section.type !== "hero" ? section.id : undefined}>
          <RenderSection section={section} colors={colors} gs={gs} ty={ty} />
        </div>
      ))}

      {/* Footer */}
      {(() => {
        const footer = content.footer ?? {};
        const footerBg = footer.backgroundColor ?? colors.secondary;
        const colCount = footer.columns?.length ?? 3;
        const gridCols = colCount === 1 ? "" : colCount === 2 ? "md:grid-cols-2" : colCount === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

        const renderColumn = (col: FooterColumn, i: number) => {
          if (col.type === "brand") {
            return (
              <div key={i}>
                {col.logoImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={col.logoImageUrl} alt={col.logo ?? content.siteTitle} className="h-8 mb-3 object-contain" />
                ) : (
                  <span className="text-2xl tracking-tighter block mb-3" style={{ color: colors.primary, fontFamily: headingFontCss, fontWeight: hW(ty) }}>
                    {col.logo ?? content.siteTitle}
                  </span>
                )}
                {col.tagline && <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.45 }}>{col.tagline}</p>}
              </div>
            );
          }
          if (col.type === "links") {
            return (
              <div key={i}>
                {col.title && <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>{col.title}</p>}
                <ul className="flex flex-col gap-2">
                  {col.links.map((link, li) => (
                    <li key={li}>
                      <a href={link.href} className="text-sm transition-colors duration-150 hover:opacity-100" style={{ color: colors.text, opacity: 0.5 }}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          if (col.type === "social") {
            return (
              <div key={i}>
                {col.title && <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>{col.title}</p>}
                <div className="flex gap-3 flex-wrap">
                  {col.socialLinks.map((s, si) => (
                    <a key={si} href={s.href || "#"} className="w-9 h-9 rounded flex items-center justify-center text-xs font-black transition-all duration-150 hover:brightness-110"
                      style={{ backgroundColor: `${colors.primary}20`, color: colors.accent, borderRadius: getBR(undefined, gs) }} aria-label={s.platform}>{s.icon}</a>
                  ))}
                </div>
              </div>
            );
          }
          if (col.type === "text") {
            return (
              <div key={i}>
                {col.title && <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>{col.title}</p>}
                <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.55 }}>{col.text}</p>
              </div>
            );
          }
          if (col.type === "contact") {
            return (
              <div key={i}>
                {col.title && <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>{col.title}</p>}
                <div className="flex flex-col gap-1.5 text-sm" style={{ color: colors.text, opacity: 0.55 }}>
                  {col.phone && <span>{col.phone}</span>}
                  {col.email && <span>{col.email}</span>}
                  {col.address && <span>{col.address}</span>}
                </div>
              </div>
            );
          }
          return null;
        };

        // Legacy fallback: no columns defined — auto-build 3-col from old schema
        const legacyColumns: FooterColumn[] = footer.columns ?? [
          { type: "brand", tagline: footer.tagline },
          { type: "links", title: "Quick Links", links: navSections.map(s => ({ label: s.data?.title || s.id, href: `#${s.id}` })) },
          { type: "social", title: "Follow Us", socialLinks: (footer.socialLinks ?? []).map(s => ({ platform: s, icon: s, href: "#" })) },
        ];

        return (
          <footer style={{ backgroundColor: footerBg, borderTop: `1px solid ${colors.primary}15`, padding: "64px 24px 32px" }}>
            {footer.customCSS && <style dangerouslySetInnerHTML={{ __html: footer.customCSS }} />}
            <div className="max-w-6xl mx-auto">
              {footer.layout === "centered" ? (
                <div className="text-center mb-12">
                  {legacyColumns.map(renderColumn)}
                </div>
              ) : (
                <div className={`grid gap-10 mb-12 ${gridCols}`}>
                  {legacyColumns.map(renderColumn)}
                </div>
              )}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
                style={{ borderTop: `1px solid ${colors.primary}15`, color: colors.text, opacity: 0.35 }}>
                <p>{footer.copyright ?? `\u00A9 ${new Date().getFullYear()} ${content.siteTitle}. All rights reserved.`}</p>
                <Link href="/admin" className="underline transition-opacity hover:opacity-100" style={{ color: colors.text }}>Edit this site</Link>
              </div>
            </div>
          </footer>
        );
      })()}

    </main>
  );
}
