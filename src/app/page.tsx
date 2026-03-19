import fs from "fs";
import path from "path";
import Link from "next/link";

type SiteContent = {
  siteTitle: string;
  hero: { headline: string; subheadline: string; ctaText: string; ctaLink: string };
  about: { title: string; description: string };
  classes: { title: string; items: { name: string; time: string; days: string; description: string }[] };
  pricing: {
    title: string;
    plans: { name: string; price: string; period: string; features: string[]; popular?: boolean }[];
  };
  testimonials: { title: string; items: { name: string; text: string; role: string }[] };
  contact: { title: string; address: string; phone: string; email: string; hours: string };
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
};

function getContent(): SiteContent {
  const filePath = path.join(process.cwd(), "content", "current.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export const dynamic = "force-dynamic";

const CLASS_ICONS: Record<string, string> = {
  "HIIT Blitz": "🔥",
  "Power Lifting": "💪",
  "Yoga Flow": "🧘",
  "Boxing Fundamentals": "🥊",
};

export default function Home() {
  const content = getContent();
  const { colors } = content;

  return (
    <main style={{ backgroundColor: colors.background, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{
          backgroundColor: "rgba(3, 13, 6, 0.85)",
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
            {["About", "Classes", "Pricing", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium uppercase tracking-widest transition-colors duration-150"
                style={{ color: colors.text, opacity: 0.75 }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = colors.accent)}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = colors.text)}
              >
                {item}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="px-5 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all duration-150 hover:brightness-110"
            style={{ backgroundColor: colors.primary, color: "#fff" }}
          >
            Join Now
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${colors.secondary} 0%, ${colors.background} 65%)`,
        }}
      >
        {/* Green glow accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${colors.primary}20 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <span
            className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: `${colors.primary}20`, color: colors.accent, border: `1px solid ${colors.primary}40` }}
          >
            New York City&apos;s Premier Gym
          </span>
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6"
            style={{ color: colors.text }}
          >
            {content.hero.headline.split(" ").map((word, i) => (
              <span key={i}>
                {i === 1 ? (
                  <span style={{ color: colors.primary }}>{word}</span>
                ) : (
                  word
                )}
                {i < content.hero.headline.split(" ").length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.text, opacity: 0.7 }}
          >
            {content.hero.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={content.hero.ctaLink}
              className="px-8 py-4 text-base font-bold uppercase tracking-wider rounded transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: colors.primary, color: "#fff", boxShadow: `0 8px 32px ${colors.primary}40` }}
            >
              {content.hero.ctaText}
            </a>
            <a
              href="#classes"
              className="px-8 py-4 text-base font-bold uppercase tracking-wider rounded transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: `2px solid ${colors.primary}`, color: colors.accent, backgroundColor: "transparent" }}
            >
              View Classes
            </a>
          </div>

          {/* Stats row */}
          <div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden"
            style={{ border: `1px solid ${colors.primary}20`, backgroundColor: `${colors.primary}10` }}
          >
            {[
              { value: "15,000", label: "Sq Ft Facility" },
              { value: "500+", label: "Members" },
              { value: "Since 2018", label: "Established" },
              { value: "20+", label: "Classes" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center py-6 px-4"
                style={{ backgroundColor: `${colors.background}cc` }}
              >
                <span className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: colors.primary }}>
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-widest mt-1" style={{ color: colors.text, opacity: 0.5 }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.text, opacity: 0.35 }}>
            Scroll
          </span>
          <div
            className="w-px h-12"
            style={{ background: `linear-gradient(to bottom, ${colors.primary}80, transparent)` }}
          />
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-28 px-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded"
              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
            >
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight" style={{ color: colors.text }}>
              {content.about.title}
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: colors.text, opacity: 0.65 }}>
              {content.about.description}
            </p>
            <a
              href="#contact"
              className="inline-block mt-8 px-6 py-3 text-sm font-bold uppercase tracking-wider rounded transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: colors.primary, color: "#fff" }}
            >
              Start Today
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Active Members" },
              { value: "20+", label: "Expert Trainers" },
              { value: "15K", label: "Sq Ft Facility" },
              { value: "5★", label: "Rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl flex flex-col gap-2"
                style={{
                  backgroundColor: colors.secondary,
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                <span className="text-3xl font-black tracking-tight" style={{ color: colors.primary }}>
                  {stat.value}
                </span>
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: colors.text, opacity: 0.55 }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes */}
      <section id="classes" className="py-28 px-6" style={{ backgroundColor: colors.secondary }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded"
              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
            >
              Train Hard
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>
              {content.classes.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {content.classes.items.map((cls) => (
              <div
                key={cls.name}
                className="group relative p-8 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-default overflow-hidden"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.primary}20`,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}
              >
                {/* Green top border accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300"
                  style={{ backgroundColor: colors.primary }}
                />
                <div className="flex items-start gap-4">
                  <span className="text-4xl leading-none">{CLASS_ICONS[cls.name] ?? "🏋️"}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: colors.text }}>
                      {cls.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ backgroundColor: `${colors.primary}18`, color: colors.accent }}
                      >
                        {cls.days}
                      </span>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ backgroundColor: `${colors.primary}18`, color: colors.accent }}
                      >
                        {cls.time}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.6 }}>
                      {cls.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded"
              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
            >
              Membership
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>
              {content.pricing.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {content.pricing.plans.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={
                  plan.popular
                    ? {
                        backgroundColor: colors.primary,
                        boxShadow: `0 20px 60px ${colors.primary}50`,
                        transform: "scale(1.05)",
                      }
                    : {
                        backgroundColor: colors.secondary,
                        border: `1px solid ${colors.primary}30`,
                      }
                }
              >
                {plan.popular && (
                  <div
                    className="text-center py-2 text-xs font-black uppercase tracking-[0.2em]"
                    style={{ backgroundColor: colors.accent, color: colors.secondary }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3
                    className="text-lg font-bold uppercase tracking-wider mb-4"
                    style={{ color: plan.popular ? "#fff" : colors.text, opacity: plan.popular ? 1 : 0.7 }}
                  >
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span
                      className="text-5xl font-black tracking-tight"
                      style={{ color: plan.popular ? "#fff" : colors.primary }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-sm ml-2"
                      style={{ color: plan.popular ? "rgba(255,255,255,0.65)" : colors.text, opacity: plan.popular ? 1 : 0.5 }}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-sm"
                        style={{ color: plan.popular ? "rgba(255,255,255,0.9)" : colors.text, opacity: plan.popular ? 1 : 0.75 }}
                      >
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: plan.popular ? "rgba(255,255,255,0.2)" : `${colors.primary}25`,
                            color: plan.popular ? "#fff" : colors.primary,
                          }}
                        >
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className="block w-full text-center py-3 rounded font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:brightness-110"
                    style={
                      plan.popular
                        ? { backgroundColor: "#fff", color: colors.primary }
                        : { backgroundColor: colors.primary, color: "#fff" }
                    }
                  >
                    Get Started
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-28 px-6" style={{ backgroundColor: colors.secondary }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded"
              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
            >
              Community
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>
              {content.testimonials.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {content.testimonials.items.map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-xl flex flex-col gap-6"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.primary}15`,
                }}
              >
                {/* Stars */}
                <div className="flex gap-1" aria-label="5 stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: colors.primary }}>★</span>
                  ))}
                </div>
                {/* Quote */}
                <div className="relative">
                  <span
                    className="absolute -top-2 -left-1 text-5xl leading-none font-serif select-none"
                    style={{ color: colors.primary, opacity: 0.3 }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p
                    className="text-base leading-relaxed pl-5 pt-2 italic"
                    style={{ color: colors.text, opacity: 0.8 }}
                  >
                    {t.text}
                  </p>
                </div>
                {/* Author */}
                <div className="flex items-center gap-3 mt-auto">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ backgroundColor: colors.primary, color: "#fff" }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: colors.text }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.text, opacity: 0.45 }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-28 px-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded"
              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
            >
              Reach Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>
              {content.contact.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact info */}
            <div className="flex flex-col gap-6">
              {[
                { icon: "📍", label: "Address", value: content.contact.address },
                { icon: "📞", label: "Phone", value: content.contact.phone },
                { icon: "✉️", label: "Email", value: content.contact.email },
                { icon: "🕐", label: "Hours", value: content.contact.hours },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 p-5 rounded-xl"
                  style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}15` }}
                >
                  <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: colors.primary }}>
                      {item.label}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.75 }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <form
              className="p-8 rounded-xl flex flex-col gap-5"
              style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}20` }}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="px-4 py-3 rounded text-sm outline-none transition-all duration-150 focus:ring-2"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.primary}30`,
                    color: colors.text,
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="px-4 py-3 rounded text-sm outline-none transition-all duration-150"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.primary}30`,
                    color: colors.text,
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell us about your goals..."
                  className="px-4 py-3 rounded text-sm outline-none transition-all duration-150 resize-none"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.primary}30`,
                    color: colors.text,
                  }}
                />
              </div>
              <button
                type="submit"
                className="py-3 rounded font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
                style={{ backgroundColor: colors.primary, color: "#fff" }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-16 px-6"
        style={{ backgroundColor: colors.secondary, borderTop: `1px solid ${colors.primary}15` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <span className="text-2xl font-black tracking-tighter block mb-3" style={{ color: colors.primary }}>
                {content.siteTitle}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.45 }}>
                New York&apos;s premier fitness destination. Where champions are forged.
              </p>
            </div>
            {/* Quick links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>
                Quick Links
              </p>
              <ul className="flex flex-col gap-2">
                {["About", "Classes", "Pricing", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-sm transition-colors duration-150 hover:opacity-100"
                      style={{ color: colors.text, opacity: 0.5 }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Social */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.primary }}>
                Follow Us
              </p>
              <div className="flex gap-3">
                {["IG", "FB", "TW", "YT"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded flex items-center justify-center text-xs font-black transition-all duration-150 hover:brightness-110"
                    style={{ backgroundColor: `${colors.primary}20`, color: colors.accent }}
                    aria-label={social}
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div
            className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderTop: `1px solid ${colors.primary}15`, color: colors.text, opacity: 0.35 }}
          >
            <p>&copy; {new Date().getFullYear()} {content.siteTitle}. All rights reserved.</p>
            <Link
              href="/admin"
              className="underline transition-opacity hover:opacity-100"
              style={{ color: colors.text }}
            >
              Edit this site
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
