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

export default function Home() {
  const content = getContent();
  const { colors } = content;

  return (
    <main>
      {/* Hero */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.background} 100%)` }}
      >
        <h1
          className="text-6xl md:text-8xl font-black tracking-tighter mb-4"
          style={{ color: colors.primary }}
        >
          {content.hero.headline}
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl" style={{ color: colors.text }}>
          {content.hero.subheadline}
        </p>
        <a
          href={content.hero.ctaLink}
          className="px-8 py-4 text-lg font-bold uppercase tracking-wider rounded-sm transition-transform hover:scale-105"
          style={{ backgroundColor: colors.primary, color: "#fff" }}
        >
          {content.hero.ctaText}
        </a>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8" style={{ color: colors.primary }}>
          {content.about.title}
        </h2>
        <p className="text-lg leading-relaxed" style={{ color: colors.text, opacity: 0.85 }}>
          {content.about.description}
        </p>
      </section>

      {/* Classes */}
      <section
        id="classes"
        className="py-24 px-6"
        style={{ backgroundColor: colors.secondary }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: colors.primary }}>
            {content.classes.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {content.classes.items.map((cls) => (
              <div
                key={cls.name}
                className="p-6 rounded-sm border"
                style={{ borderColor: colors.primary + "33", backgroundColor: colors.background }}
              >
                <h3 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  {cls.name}
                </h3>
                <p className="text-sm mb-3" style={{ color: colors.text, opacity: 0.6 }}>
                  {cls.days} &middot; {cls.time}
                </p>
                <p style={{ color: colors.text, opacity: 0.8 }}>{cls.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: colors.primary }}>
            {content.pricing.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.pricing.plans.map((plan) => (
              <div
                key={plan.name}
                className="p-8 rounded-sm text-center relative"
                style={{
                  backgroundColor: plan.popular ? colors.primary : colors.secondary,
                  border: plan.popular ? "none" : `1px solid ${colors.primary}33`,
                }}
              >
                {plan.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-xs font-bold px-4 py-1 rounded-full uppercase">
                    Most Popular
                  </span>
                )}
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: plan.popular ? "#fff" : colors.text }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-4xl font-black mb-1"
                  style={{ color: plan.popular ? "#fff" : colors.primary }}
                >
                  {plan.price}
                </p>
                <p
                  className="text-sm mb-6"
                  style={{ color: plan.popular ? "rgba(255,255,255,0.7)" : colors.text, opacity: plan.popular ? 1 : 0.6 }}
                >
                  {plan.period}
                </p>
                <ul className="text-left space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: plan.popular ? "rgba(255,255,255,0.9)" : colors.text }}
                    >
                      <span style={{ color: plan.popular ? "#fff" : colors.primary }}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-24 px-6"
        style={{ backgroundColor: colors.secondary }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: colors.primary }}>
            {content.testimonials.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.testimonials.items.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-sm"
                style={{ backgroundColor: colors.background }}
              >
                <p className="text-lg mb-4 italic" style={{ color: colors.text, opacity: 0.85 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="font-bold" style={{ color: colors.primary }}>
                  {t.name}
                </p>
                <p className="text-sm" style={{ color: colors.text, opacity: 0.5 }}>
                  {t.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8" style={{ color: colors.primary }}>
            {content.contact.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <p className="mb-4" style={{ color: colors.text, opacity: 0.8 }}>
                <strong style={{ color: colors.primary }}>Address</strong>
                <br />
                {content.contact.address}
              </p>
              <p className="mb-4" style={{ color: colors.text, opacity: 0.8 }}>
                <strong style={{ color: colors.primary }}>Phone</strong>
                <br />
                {content.contact.phone}
              </p>
            </div>
            <div>
              <p className="mb-4" style={{ color: colors.text, opacity: 0.8 }}>
                <strong style={{ color: colors.primary }}>Email</strong>
                <br />
                {content.contact.email}
              </p>
              <p className="mb-4" style={{ color: colors.text, opacity: 0.8 }}>
                <strong style={{ color: colors.primary }}>Hours</strong>
                <br />
                {content.contact.hours}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center text-sm"
        style={{ backgroundColor: colors.secondary, color: colors.text, opacity: 0.5 }}
      >
        <p>&copy; {new Date().getFullYear()} {content.siteTitle}. All rights reserved.</p>
        <Link href="/admin" className="underline hover:opacity-100 transition-opacity mt-2 inline-block">
          Edit this site
        </Link>
      </footer>
    </main>
  );
}
