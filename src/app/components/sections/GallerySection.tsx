import { SP } from "./types";
import { getBR, getMW, getPad, getSectionBg, getAnimClass } from "./helpers";
import { SectionHeader } from "./shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function GallerySection({ data, colors, ss, gs, ty }: SP) {
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
                    <span className="text-4xl block mb-2">{item.icon ?? "\ud83d\udcf7"}</span>
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
