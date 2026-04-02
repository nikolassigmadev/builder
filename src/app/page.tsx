import fs from "fs";
import path from "path";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Section = {
  id: string;
  type: string;
  visible: boolean;
  data: any;
};

type SiteContent = {
  siteTitle: string;
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
  nav: { ctaText: string; ctaLink: string };
  footer: { tagline: string; socialLinks: string[] };
  sections: Section[];
};

function getContent(): SiteContent {
  try {
    const projectPath = path.join(process.cwd(), "content", "current.json");
    const tmpPath = "/tmp/content/current.json";
    try {
      fs.accessSync(path.dirname(projectPath), fs.constants.W_OK);
      return JSON.parse(fs.readFileSync(projectPath, "utf-8"));
    } catch {
      if (fs.existsSync(tmpPath)) {
        return JSON.parse(fs.readFileSync(tmpPath, "utf-8"));
      }
      return JSON.parse(fs.readFileSync(projectPath, "utf-8"));
    }
  } catch {
    return DEFAULT_CONTENT;
  }
}

export const dynamic = "force-dynamic";

const DEFAULT_CONTENT: SiteContent = {
  siteTitle: "Iron Forge Gym",
  colors: { primary: "#16a34a", secondary: "#052e16", accent: "#86efac", background: "#030d06", text: "#f0fdf4" },
  nav: { ctaText: "Join Now", ctaLink: "#contact" },
  footer: { tagline: "New York's premier fitness destination.", socialLinks: ["IG", "FB", "TW", "YT"] },
  sections: [],
};

// ── Section Renderers ──────────────────────────────────────────────

function HeroSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.secondary} 0%, ${colors.background} 65%)` }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${colors.primary}20 0%, transparent 70%)`, filter: "blur(40px)" }}
      />
      <div className="relative z-10 max-w-5xl mx-auto">
        {data.badge && (
          <span
            className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: `${colors.primary}20`, color: colors.accent, border: `1px solid ${colors.primary}40` }}
          >
            {data.badge}
          </span>
        )}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6" style={{ color: colors.text }}>
          {(data.headline ?? "").split(" ").map((word: string, i: number, arr: string[]) => (
            <span key={i}>
              {i === 1 ? <span style={{ color: colors.primary }}>{word}</span> : word}
              {i < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: colors.text, opacity: 0.7 }}>
          {data.subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {data.ctaText && (
            <a
              href={data.ctaLink || "#"}
              className="px-8 py-4 text-base font-bold uppercase tracking-wider rounded transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: colors.primary, color: "#fff", boxShadow: `0 8px 32px ${colors.primary}40` }}
            >
              {data.ctaText}
            </a>
          )}
          {data.secondaryCtaText && (
            <a
              href={data.secondaryCtaLink || "#"}
              className="px-8 py-4 text-base font-bold uppercase tracking-wider rounded transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: `2px solid ${colors.primary}`, color: colors.accent, backgroundColor: "transparent" }}
            >
              {data.secondaryCtaText}
            </a>
          )}
        </div>
        {data.stats && data.stats.length > 0 && (
          <div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden"
            style={{ border: `1px solid ${colors.primary}20`, backgroundColor: `${colors.primary}10` }}
          >
            {data.stats.map((stat: any) => (
              <div key={stat.label} className="flex flex-col items-center justify-center py-6 px-4" style={{ backgroundColor: `${colors.background}cc` }}>
                <span className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: colors.primary }}>{stat.value}</span>
                <span className="text-xs uppercase tracking-widest mt-1" style={{ color: colors.text, opacity: 0.5 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.text, opacity: 0.35 }}>Scroll</span>
        <div className="w-px h-12" style={{ background: `linear-gradient(to bottom, ${colors.primary}80, transparent)` }} />
      </div>
    </section>
  );
}

function AboutSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight" style={{ color: colors.text }}>{data.title}</h2>
          <p className="text-lg leading-relaxed" style={{ color: colors.text, opacity: 0.65 }}>{data.description}</p>
          {data.ctaText && (
            <a href={data.ctaLink || "#"} className="inline-block mt-8 px-6 py-3 text-sm font-bold uppercase tracking-wider rounded transition-all duration-200 hover:brightness-110" style={{ backgroundColor: colors.primary, color: "#fff" }}>
              {data.ctaText}
            </a>
          )}
        </div>
        {data.stats && data.stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {data.stats.map((stat: any) => (
              <div key={stat.label} className="p-6 rounded-xl flex flex-col gap-2" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}20` }}>
                <span className="text-3xl font-black tracking-tight" style={{ color: colors.primary }}>{stat.value}</span>
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: colors.text, opacity: 0.55 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ClassesSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.secondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {(data.items ?? []).map((cls: any) => (
            <div
              key={cls.name}
              className="group relative p-8 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-default overflow-hidden"
              style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}20`, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300" style={{ backgroundColor: colors.primary }} />
              <div className="flex items-start gap-4">
                <span className="text-4xl leading-none">{cls.icon ?? "\ud83c\udfcb\ufe0f"}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: colors.text }}>{cls.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cls.days && <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${colors.primary}18`, color: colors.accent }}>{cls.days}</span>}
                    {cls.time && <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${colors.primary}18`, color: colors.accent }}>{cls.time}</span>}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.6 }}>{cls.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {(data.plans ?? []).map((plan: any) => (
            <div
              key={plan.name}
              className="relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={plan.popular
                ? { backgroundColor: colors.primary, boxShadow: `0 20px 60px ${colors.primary}50`, transform: "scale(1.05)" }
                : { backgroundColor: colors.secondary, border: `1px solid ${colors.primary}30` }}
            >
              {plan.popular && (
                <div className="text-center py-2 text-xs font-black uppercase tracking-[0.2em]" style={{ backgroundColor: colors.accent, color: colors.secondary }}>Most Popular</div>
              )}
              <div className="p-8">
                <h3 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: plan.popular ? "#fff" : colors.text, opacity: plan.popular ? 1 : 0.7 }}>{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-black tracking-tight" style={{ color: plan.popular ? "#fff" : colors.primary }}>{plan.price}</span>
                  <span className="text-sm ml-2" style={{ color: plan.popular ? "rgba(255,255,255,0.65)" : colors.text, opacity: plan.popular ? 1 : 0.5 }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {(plan.features ?? []).map((f: string) => (
                    <li key={f} className="flex items-center gap-3 text-sm" style={{ color: plan.popular ? "rgba(255,255,255,0.9)" : colors.text, opacity: plan.popular ? 1 : 0.75 }}>
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: plan.popular ? "rgba(255,255,255,0.2)" : `${colors.primary}25`, color: plan.popular ? "#fff" : colors.primary }}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="block w-full text-center py-3 rounded font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:brightness-110"
                  style={plan.popular ? { backgroundColor: "#fff", color: colors.primary } : { backgroundColor: colors.primary, color: "#fff" }}>
                  Get Started
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.secondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(data.items ?? []).map((t: any) => (
            <div key={t.name} className="p-8 rounded-xl flex flex-col gap-6" style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}15` }}>
              <div className="flex gap-1" aria-label="5 stars">
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: colors.primary }}>&#9733;</span>)}
              </div>
              <div className="relative">
                <span className="absolute -top-2 -left-1 text-5xl leading-none font-serif select-none" style={{ color: colors.primary, opacity: 0.3 }} aria-hidden="true">&ldquo;</span>
                <p className="text-base leading-relaxed pl-5 pt-2 italic" style={{ color: colors.text, opacity: 0.8 }}>{t.text}</p>
              </div>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ backgroundColor: colors.primary, color: "#fff" }}>
                  {(t.name ?? "?").charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: colors.text }}>{t.name}</p>
                  <p className="text-xs" style={{ color: colors.text, opacity: 0.45 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-6">
            {[
              { icon: "\ud83d\udccd", label: "Address", value: data.address },
              { icon: "\ud83d\udcde", label: "Phone", value: data.phone },
              { icon: "\u2709\ufe0f", label: "Email", value: data.email },
              { icon: "\ud83d\udd50", label: "Hours", value: data.hours },
            ].filter(item => item.value).map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-5 rounded-xl" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}15` }}>
                <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: colors.primary }}>{item.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.75 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="p-8 rounded-xl flex flex-col gap-5" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}20` }}>
            {(data.formFields ?? [
              { name: "name", label: "Name", type: "text", placeholder: "Your full name" },
              { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { name: "message", label: "Message", type: "textarea", placeholder: "Tell us about your goals..." },
            ]).map((field: any) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.primary }}>{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea name={field.name} rows={5} placeholder={field.placeholder} className="px-4 py-3 rounded text-sm outline-none transition-all duration-150 resize-none"
                    style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}30`, color: colors.text }} />
                ) : (
                  <input type={field.type || "text"} name={field.name} placeholder={field.placeholder} className="px-4 py-3 rounded text-sm outline-none transition-all duration-150"
                    style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}30`, color: colors.text }} />
                )}
              </div>
            ))}
            <button type="submit" className="py-3 rounded font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
              style={{ backgroundColor: colors.primary, color: "#fff" }}>
              {data.submitText ?? "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ── NEW section types ──────────────────────────────────────────────

function FeaturesSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.secondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
          {data.subtitle && <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: colors.text, opacity: 0.6 }}>{data.subtitle}</p>}
        </div>
        <div className={`grid gap-8 ${data.columns === 2 ? "md:grid-cols-2" : data.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          {(data.items ?? []).map((item: any, i: number) => (
            <div key={i} className="p-8 rounded-xl text-center" style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}15` }}>
              {item.icon && <span className="text-4xl mb-4 block">{item.icon}</span>}
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.6 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
        </div>
        <div className="flex flex-col gap-4">
          {(data.items ?? []).map((item: any, i: number) => (
            <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}15` }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.primary }}>{item.question}</h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.7 }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBannerSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.primary }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: "#fff" }}>{data.title}</h2>
        {data.description && <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>{data.description}</p>}
        {data.ctaText && (
          <a href={data.ctaLink || "#"} className="inline-block px-8 py-4 text-base font-bold uppercase tracking-wider rounded transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
            style={{ backgroundColor: "#fff", color: colors.primary }}>
            {data.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function TeamSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.secondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
        </div>
        <div className={`grid gap-8 ${data.columns === 2 ? "md:grid-cols-2" : data.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          {(data.members ?? []).map((member: any, i: number) => (
            <div key={i} className="p-8 rounded-xl text-center" style={{ backgroundColor: colors.background, border: `1px solid ${colors.primary}15` }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ backgroundColor: colors.primary, color: "#fff" }}>
                {(member.name ?? "?").charAt(0)}
              </div>
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>{member.name}</h3>
              <p className="text-sm font-medium mb-3" style={{ color: colors.primary }}>{member.role}</p>
              {member.bio && <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.6 }}>{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextBlockSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  const align = data.alignment === "center" ? "text-center mx-auto" : data.alignment === "right" ? "text-right ml-auto" : "";
  return (
    <section className="py-28 px-6" style={{ backgroundColor: data.bgColor === "secondary" ? colors.secondary : colors.background }}>
      <div className={`max-w-4xl mx-auto ${align}`}>
        {data.label && (
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
            {data.label}
          </span>
        )}
        {data.title && <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6" style={{ color: colors.text }}>{data.title}</h2>}
        {data.content && (
          <div className="text-lg leading-relaxed space-y-4" style={{ color: colors.text, opacity: 0.7 }}>
            {data.content.split("\n\n").map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
        )}
        {data.ctaText && (
          <a href={data.ctaLink || "#"} className="inline-block mt-8 px-6 py-3 text-sm font-bold uppercase tracking-wider rounded transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: colors.primary, color: "#fff" }}>
            {data.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function StatsSection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.secondary }}>
      <div className="max-w-6xl mx-auto">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
          </div>
        )}
        <div className={`grid gap-8 ${data.columns === 2 ? "grid-cols-2" : data.columns === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
          {(data.items ?? []).map((stat: any, i: number) => (
            <div key={i} className="text-center p-6">
              <span className="text-4xl md:text-5xl font-black tracking-tight block mb-2" style={{ color: colors.primary }}>{stat.value}</span>
              <span className="text-sm uppercase tracking-widest" style={{ color: colors.text, opacity: 0.5 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ data, colors }: { data: any; colors: SiteContent["colors"] }) {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          {data.label && (
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              {data.label}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>{data.title}</h2>
        </div>
        <div className={`grid gap-4 ${data.columns === 2 ? "md:grid-cols-2" : data.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          {(data.items ?? []).map((item: any, i: number) => (
            <div key={i} className="aspect-video rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}15` }}>
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.caption || ""} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-4xl block mb-2">{item.icon ?? "\ud83d\udcf7"}</span>
                  {item.caption && <p className="text-sm" style={{ color: colors.text, opacity: 0.5 }}>{item.caption}</p>}
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

function RenderSection({ section, colors }: { section: Section; colors: SiteContent["colors"] }) {
  if (!section.visible) return null;
  const props = { data: section.data, colors };
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
  const { colors, sections } = content;

  // Build nav links from visible sections that have an id
  const navSections = (sections ?? []).filter(
    (s) => s.visible && s.id && !["hero", "cta_banner"].includes(s.type)
  );

  return (
    <main style={{ backgroundColor: colors.background, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{
          backgroundColor: `${colors.background}d9`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${colors.primary}22`,
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xl font-black tracking-tighter" style={{ color: colors.primary }}>
            {content.siteTitle}
          </span>
          <div className="hidden md:flex items-center gap-8">
            {navSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm font-medium uppercase tracking-widest transition-opacity duration-150 hover:opacity-100"
                style={{ color: colors.text, opacity: 0.65 }}
              >
                {s.data?.title || s.id}
              </a>
            ))}
          </div>
          {content.nav?.ctaText && (
            <a
              href={content.nav.ctaLink || "#"}
              className="px-5 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all duration-150 hover:brightness-110"
              style={{ backgroundColor: colors.primary, color: "#fff" }}
            >
              {content.nav.ctaText}
            </a>
          )}
        </div>
      </nav>

      {/* Dynamic Sections */}
      {(sections ?? []).map((section) => (
        <div key={section.id} id={section.type !== "hero" ? section.id : undefined}>
          <RenderSection section={section} colors={colors} />
        </div>
      ))}

      {/* Footer */}
      <footer className="py-16 px-6" style={{ backgroundColor: colors.secondary, borderTop: `1px solid ${colors.primary}15` }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <span className="text-2xl font-black tracking-tighter block mb-3" style={{ color: colors.primary }}>{content.siteTitle}</span>
              <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.45 }}>{content.footer?.tagline}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>Quick Links</p>
              <ul className="flex flex-col gap-2">
                {navSections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-sm transition-colors duration-150 hover:opacity-100" style={{ color: colors.text, opacity: 0.5 }}>
                      {s.data?.title || s.id}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>Follow Us</p>
              <div className="flex gap-3">
                {(content.footer?.socialLinks ?? []).map((social) => (
                  <a key={social} href="#" className="w-9 h-9 rounded flex items-center justify-center text-xs font-black transition-all duration-150 hover:brightness-110"
                    style={{ backgroundColor: `${colors.primary}20`, color: colors.accent }} aria-label={social}>
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderTop: `1px solid ${colors.primary}15`, color: colors.text, opacity: 0.35 }}>
            <p>&copy; {new Date().getFullYear()} {content.siteTitle}. All rights reserved.</p>
            <Link href="/admin" className="underline transition-opacity hover:opacity-100" style={{ color: colors.text }}>Edit this site</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
