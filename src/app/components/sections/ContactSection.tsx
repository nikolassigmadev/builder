import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getCardSty, hFont, bFont } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function ContactSection({ data, colors, ss, gs, ty }: SP) {
  const layout = ss?.layout ?? "side-by-side";
  const co = ss?.colorOverrides;
  const p = co?.primary ?? colors.primary;
  const bgSty = { ...getSectionBg(ss, colors.background), padding: getPad(ss, gs) };

  const infoItems = [
    { icon: "\ud83d\udccd", label: "Address", value: data.address },
    { icon: "\ud83d\udcde", label: "Phone", value: data.phone },
    { icon: "\u2709\ufe0f", label: "Email", value: data.email },
    { icon: "\ud83d\udd50", label: "Hours", value: data.hours },
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
