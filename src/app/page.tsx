import fs from "fs";
import path from "path";
import Link from "next/link";

import {
  HeroSection, AboutSection, ClassesSection, PricingSection,
  TestimonialsSection, ContactSection, FeaturesSection, FaqSection,
  CtaBannerSection, TeamSection, TextBlockSection, StatsSection, GallerySection,
  getBR, FONTS, hFont, bFont, hW,
} from "./components/sections";
import type { SiteContent, Section, GlobalStyle, Typography, FooterColumn } from "./components/sections";

// ── Content Loading ────────────────────────────────────────────────

export const revalidate = 0;

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
