import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const BUNDLED_CURRENT_PATH = path.join(process.cwd(), "content", "current.json");
const TMP_DIR = "/tmp/content";
const TMP_CURRENT_PATH = path.join(TMP_DIR, "current.json");
const TMP_HISTORY_DIR = path.join(TMP_DIR, "history");

function isProjectWritable() {
  try { fs.accessSync(path.dirname(BUNDLED_CURRENT_PATH), fs.constants.W_OK); return true; } catch { return false; }
}

function getActivePaths() {
  if (isProjectWritable()) {
    return { currentPath: BUNDLED_CURRENT_PATH, historyDir: path.join(process.cwd(), "content", "history") };
  }
  return { currentPath: TMP_CURRENT_PATH, historyDir: TMP_HISTORY_DIR };
}

function getContent() {
  const { currentPath } = getActivePaths();
  if (currentPath === TMP_CURRENT_PATH && !fs.existsSync(TMP_CURRENT_PATH)) {
    return JSON.parse(fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8"));
  }
  return JSON.parse(fs.readFileSync(currentPath, "utf-8"));
}

async function saveContent(content: Record<string, unknown>): Promise<string> {
  const { currentPath, historyDir } = getActivePaths();
  if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });
  const current = fs.existsSync(currentPath) ? fs.readFileSync(currentPath, "utf-8") : fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(historyDir, `${timestamp}.json`), current);
  const newContent = JSON.stringify(content, null, 2);
  fs.writeFileSync(currentPath, newContent);
  return await pushToGitHub(newContent);
}

async function patchContent(patches: Array<{ op: string; path: string; value?: unknown }>): Promise<{ content: Record<string, unknown>; result: string }> {
  const content = getContent() as Record<string, unknown>;

  for (const patch of patches) {
    const parts = patch.path.replace(/^\//, "").split("/");
    let obj: any = content;

    if (patch.op === "replace" || patch.op === "add") {
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!(key in obj)) obj[key] = {};
        obj = obj[key];
      }
      const lastKey = parts[parts.length - 1];
      obj[lastKey] = patch.value;
    } else if (patch.op === "remove") {
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
        if (!obj) break;
      }
      if (obj) delete obj[parts[parts.length - 1]];
    }
  }

  const result = await saveContent(content);
  return { content, result };
}

async function pushToGitHub(newContent: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return "warning: GITHUB_TOKEN or GITHUB_REPO not set — change saved temporarily but will not persist after server restart";

  const apiUrl = `https://api.github.com/repos/${repo}/contents/content/current.json`;
  const getRes = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
  if (!getRes.ok) return `warning: GitHub sync failed (could not get file SHA: ${getRes.status})`;
  const { sha } = await getRes.json();

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ message: "chore: update site content via admin panel", content: Buffer.from(newContent).toString("base64"), sha }),
  });
  if (!putRes.ok) return `warning: GitHub sync failed (${putRes.status}) — change is temporary`;
  return "success: saved to GitHub, Vercel will redeploy in ~30 seconds";
}

function getSnapshots() {
  const { historyDir } = getActivePaths();
  if (!fs.existsSync(historyDir)) return [];
  return fs.readdirSync(historyDir).filter(f => f.endsWith(".json")).sort().reverse()
    .map(f => ({ filename: f, timestamp: f.replace(".json", "") }));
}

function restoreSnapshot(filename: string): boolean {
  const { currentPath, historyDir } = getActivePaths();
  const snapshotPath = path.join(historyDir, filename);
  if (!fs.existsSync(snapshotPath)) return false;
  if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });
  const current = fs.existsSync(currentPath) ? fs.readFileSync(currentPath, "utf-8") : fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8");
  fs.writeFileSync(path.join(historyDir, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`), current);
  fs.writeFileSync(currentPath, fs.readFileSync(snapshotPath, "utf-8"));
  return true;
}

async function searchImages(query: string, count = 5): Promise<Array<{ url: string; description: string }>> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey) {
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`, {
        headers: { Authorization: `Client-ID ${accessKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.results.map((r: any) => ({ url: r.urls.regular, description: r.alt_description || r.description || query }));
      }
    } catch { /* fall through */ }
  }
  // Fallback: Picsum Photos with stable seeds
  return Array.from({ length: count }, (_, i) => ({
    url: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/1200/800`,
    description: `${query} placeholder image ${i + 1}`,
  }));
}

// ── Preset Themes ──────────────────────────────────────────────────

const THEMES: Record<string, Record<string, unknown>> = {
  "dark-luxury": {
    colors: { primary: "#d4af37", secondary: "#1a1a2e", accent: "#f5d76e", background: "#0a0a0f", text: "#f8f6f0" },
    globalStyle: { cardStyle: "glass", borderRadius: "lg", sectionSpacing: "relaxed", animations: true },
    typography: { headingFont: "Playfair Display", headingWeight: "black" },
  },
  "bright-minimal": {
    colors: { primary: "#1a1a1a", secondary: "#f5f5f5", accent: "#555555", background: "#ffffff", text: "#1a1a1a" },
    globalStyle: { cardStyle: "bordered", borderRadius: "sm", sectionSpacing: "normal" },
    typography: { headingFont: "Inter", headingWeight: "black" },
  },
  "bold-athletic": {
    colors: { primary: "#e63946", secondary: "#1d3557", accent: "#f1faee", background: "#0d0d0d", text: "#f1faee" },
    globalStyle: { cardStyle: "elevated", borderRadius: "none", sectionSpacing: "compact", animations: true },
    typography: { headingFont: "Oswald", headingWeight: "black" },
  },
  "ocean-blue": {
    colors: { primary: "#0096c7", secondary: "#023e8a", accent: "#90e0ef", background: "#03045e", text: "#caf0f8" },
    globalStyle: { cardStyle: "glass", borderRadius: "xl", animations: true },
    typography: { headingFont: "Montserrat", headingWeight: "extrabold" },
  },
  "sunset-orange": {
    colors: { primary: "#f77f00", secondary: "#2d1b0e", accent: "#fcbf49", background: "#120500", text: "#fef3e2" },
    globalStyle: { cardStyle: "elevated", borderRadius: "md", animations: true },
    typography: { headingFont: "Oswald", headingWeight: "black" },
  },
  "forest-green": {
    colors: { primary: "#16a34a", secondary: "#052e16", accent: "#86efac", background: "#030d06", text: "#f0fdf4" },
    globalStyle: { cardStyle: "elevated", borderRadius: "md" },
    typography: { headingFont: "Inter", headingWeight: "black" },
  },
  "midnight-purple": {
    colors: { primary: "#7c3aed", secondary: "#1e1b4b", accent: "#c4b5fd", background: "#0f0a1e", text: "#ede9fe" },
    globalStyle: { cardStyle: "glass", borderRadius: "xl", animations: true },
    typography: { headingFont: "Space Grotesk", headingWeight: "black" },
  },
  "corporate-navy": {
    colors: { primary: "#1e40af", secondary: "#1e3a5f", accent: "#93c5fd", background: "#0c1a2e", text: "#e2e8f0" },
    globalStyle: { cardStyle: "bordered", borderRadius: "sm" },
    typography: { headingFont: "DM Sans", headingWeight: "bold" },
  },
  "rose-gold": {
    colors: { primary: "#c084fc", secondary: "#1e0a2e", accent: "#f9a8d4", background: "#0d0012", text: "#fdf2f8" },
    globalStyle: { cardStyle: "glass", borderRadius: "xl", animations: true },
    typography: { headingFont: "Playfair Display", headingWeight: "bold" },
  },
  "monochrome": {
    colors: { primary: "#ffffff", secondary: "#111111", accent: "#888888", background: "#000000", text: "#ffffff" },
    globalStyle: { cardStyle: "bordered", borderRadius: "none", sectionSpacing: "relaxed" },
    typography: { headingFont: "Bebas Neue", headingWeight: "black" },
  },
};

// ── Tool Definitions ───────────────────────────────────────────────

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_current_content",
      description: "Get the current website content as JSON. Always call this first before making changes to see the latest state.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "update_content",
      description: "Replace the entire website content JSON. Use this for major changes (multiple sections, theme changes, full redesigns). For small targeted edits, prefer patch_content instead.",
      parameters: {
        type: "object",
        properties: { content: { type: "object", description: "The full updated content JSON object" } },
        required: ["content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "patch_content",
      description: "Make surgical edits to specific fields without touching the rest. Much faster and safer than update_content for small changes. Use JSON Patch paths like /colors/primary, /sections/0/data/headline, /globalStyle/cardStyle.",
      parameters: {
        type: "object",
        properties: {
          patches: {
            type: "array",
            description: "Array of patch operations",
            items: {
              type: "object",
              properties: {
                op: { type: "string", enum: ["replace", "add", "remove"], description: "Operation type" },
                path: { type: "string", description: "JSON Pointer path e.g. /colors/primary or /sections/0/data/headline or /globalStyle/borderRadius" },
                value: { description: "New value (not needed for remove)" },
              },
              required: ["op", "path"],
            },
          },
        },
        required: ["patches"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "apply_theme",
      description: "Apply a complete visual theme that sets colors, typography, card style, border radius, animations and spacing all at once. Themes: dark-luxury, bright-minimal, bold-athletic, ocean-blue, sunset-orange, forest-green, midnight-purple, corporate-navy, rose-gold, monochrome.",
      parameters: {
        type: "object",
        properties: {
          theme: { type: "string", description: "Theme name to apply" },
          preserve_content: { type: "boolean", description: "If true, keeps all section data/text and only changes visual styles. Default: true." },
        },
        required: ["theme"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_images",
      description: "Search for images to use on the site. Returns URLs you can set as imageUrl on hero, gallery items, team member avatarUrl, or section backgrounds. If UNSPLASH_ACCESS_KEY is set, uses Unsplash. Otherwise returns placeholder URLs.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query e.g. 'gym workout', 'fitness trainer', 'modern gym interior'" },
          count: { type: "number", description: "Number of images to return (1-10, default 5)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_snapshots",
      description: "List all saved versions of the website. Each is a previous state that can be restored.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "restore_snapshot",
      description: "Restore the website to a previous version. Use list_snapshots first to find the right one.",
      parameters: {
        type: "object",
        properties: { filename: { type: "string", description: "Snapshot filename e.g. '2026-03-19T14-00-00-000Z.json'" } },
        required: ["filename"],
      },
    },
  },
];

// ── System Prompt ──────────────────────────────────────────────────

function buildSystemPrompt(currentContent: Record<string, unknown>): string {
  return `You are an expert website designer and editor. You have complete control over every visual and content aspect of this website. When the user describes what they want — even vaguely — you interpret it and make it real.

Current website content:
${JSON.stringify(currentContent, null, 2)}

═══════════════════════════════════════════════════════════
## CONTENT SCHEMA
═══════════════════════════════════════════════════════════

### Root Fields
- **siteTitle**: Site name shown in nav and footer
- **colors**: { primary, secondary, accent, background, text } — any valid CSS color (hex, rgb, hsl)
- **nav**: { ctaText, ctaLink }
- **footer**: { tagline, socialLinks: string[] }
- **typography**: Controls all fonts and text weight (see Typography section)
- **globalStyle**: Controls visual style across all sections (see GlobalStyle section)
- **globalCSS**: Raw CSS string injected globally — use for advanced custom styles
- **sections**: Ordered array of section objects rendered top-to-bottom

### Section Object
\`\`\`json
{
  "id": "unique-id",
  "type": "section_type",
  "visible": true,
  "style": { ... },   ← optional per-section overrides
  "data": { ... }     ← section content
}
\`\`\`

═══════════════════════════════════════════════════════════
## TYPOGRAPHY (root-level "typography" object)
═══════════════════════════════════════════════════════════

\`\`\`json
{
  "headingFont": "Inter" | "Playfair Display" | "Oswald" | "Montserrat" | "Space Grotesk" | "DM Sans" | "Bebas Neue",
  "bodyFont": "Inter" | "Playfair Display" | "Oswald" | "Montserrat" | "Space Grotesk" | "DM Sans",
  "headingWeight": "bold" | "extrabold" | "black",
  "baseSize": "sm" | "md" | "lg"
}
\`\`\`

Font personality guide:
- **Inter**: Clean, modern, professional (default)
- **Playfair Display**: Elegant, luxury, editorial (great for premium brands)
- **Oswald**: Bold, condensed, athletic (great for gyms, sports)
- **Montserrat**: Geometric, friendly, versatile
- **Space Grotesk**: Techy, modern, distinctive
- **DM Sans**: Minimal, readable, contemporary
- **Bebas Neue**: Ultra-bold, all-caps display (max impact)

═══════════════════════════════════════════════════════════
## GLOBAL STYLE (root-level "globalStyle" object)
═══════════════════════════════════════════════════════════

\`\`\`json
{
  "borderRadius": "none" | "sm" | "md" | "lg" | "xl",
  "cardStyle": "flat" | "elevated" | "bordered" | "glass",
  "maxWidth": "sm" | "md" | "lg" | "xl" | "full",
  "sectionSpacing": "compact" | "normal" | "relaxed",
  "animations": true | false,
  "navStyle": "solid" | "transparent" | "floating"
}
\`\`\`

Card style guide:
- **flat**: No border or shadow, pure background color
- **elevated**: Drop shadow (classic card look)
- **bordered**: Thin colored border, no shadow
- **glass**: Frosted glass with blur and translucent background (best on dark sites)

═══════════════════════════════════════════════════════════
## PER-SECTION STYLE (each section's "style" object)
═══════════════════════════════════════════════════════════

Each section can override global styles:
\`\`\`json
{
  "layout": "variant-name",
  "background": { "type": "color" | "gradient" | "image", "value": "..." },
  "padding": "none" | "sm" | "md" | "lg" | "xl",
  "textAlign": "left" | "center" | "right",
  "borderRadius": "none" | "sm" | "md" | "lg" | "xl",
  "maxWidth": "sm" | "md" | "lg" | "xl" | "full",
  "animation": "none" | "fadeIn" | "slideUp" | "slideLeft",
  "colorOverrides": { "bg": "#hex", "text": "#hex", "accent": "#hex", "primary": "#hex" },
  "customCSS": "arbitrary CSS string applied to this section's wrapper"
}
\`\`\`

Background examples:
- Solid: \`{ "type": "color", "value": "#1a1a1a" }\`
- Gradient: \`{ "type": "gradient", "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }\`
- Image: \`{ "type": "image", "value": "https://..." }\`

═══════════════════════════════════════════════════════════
## LAYOUT VARIANTS
═══════════════════════════════════════════════════════════

Each section type supports multiple visual layouts via \`style.layout\`:

**hero**: "centered" (default) | "split" | "minimal"
- centered: Full-screen, headline centered, optional stats bar at bottom
- split: Text on left, image/visual on right (set data.imageUrl for a photo, data.heroIcon for emoji)
- minimal: Ultra-clean typography-only, no decorations

**about**: "split" (default) | "centered" | "stacked"
- split: Text left, stats grid right
- centered: All centered, stats in a row below
- stacked: Full-width text, then stats below

**classes**: "grid" (default, 2 col) | "cards" (3 col compact) | "list" (full-width rows)

**pricing**: "cards" (default, floating cards with popular highlight) | "table" (comparison table with checkmarks)

**testimonials**: "cards" (default, 3-col grid) | "large" (featured quote + supporting grid)

**features**: "grid" (default, centered icon cards) | "alternating" (icon left/right alternate rows) | "icon-list" (horizontal icon+text rows)

**faq**: "default" (single column) | "two-column" (split into 2 columns)

**cta_banner**: "default" (centered on primary color) | "gradient" (gradient background) | "split" (text left, button right)

**team**: "cards" (default, avatar cards) | "list" (horizontal list rows)

**gallery**: "grid" (equal aspect ratios) | "masonry" (varied heights)

**contact**: "side-by-side" (default) | "stacked" (centered column) | "minimal" (form only)

**text_block**, **stats**: no variants (simple sections)

═══════════════════════════════════════════════════════════
## SECTION DATA SHAPES
═══════════════════════════════════════════════════════════

1. **hero**: { badge?, headline, subheadline, ctaText?, ctaLink?, secondaryCtaText?, secondaryCtaLink?, imageUrl?, heroIcon?, stats?: [{value, label}] }
2. **about**: { label?, title, description, ctaText?, ctaLink?, stats?: [{value, label}] }
3. **classes**: { label?, title, items: [{ name, icon?, time?, days?, description }] }
4. **pricing**: { label?, title, plans: [{ name, price, period, features: string[], popular?: boolean, ctaText?, ctaLink? }] }
5. **testimonials**: { label?, title, items: [{ name, text, role, rating?: 1-5, avatarUrl? }] }
6. **contact**: { label?, title, address?, phone?, email?, hours?, submitText?, formFields?: [{name, label, type, placeholder}] }
7. **features**: { label?, title, subtitle?, columns?: 2|3|4, items: [{ icon?, title, description }] }
8. **faq**: { label?, title, items: [{ question, answer }] }
9. **cta_banner**: { title, description?, ctaText?, ctaLink? }
10. **team**: { label?, title, columns?: 2|3|4, members: [{ name, role, bio?, avatarUrl? }] }
11. **text_block**: { label?, title?, content, alignment?: "left"|"center"|"right", bgColor?: "secondary", ctaText?, ctaLink? }
12. **stats**: { title?, columns?: 2|3|4, items: [{ value, label }] }
13. **gallery**: { label?, title, columns?: 2|3|4, items: [{ icon?, caption?, imageUrl?, videoUrl? }] }

═══════════════════════════════════════════════════════════
## DESIGN INTENT TRANSLATION
═══════════════════════════════════════════════════════════

When the user says something vague, translate it:

"make it look premium / luxury" →
  Apply dark-luxury theme OR: glass cards, Playfair Display, relaxed spacing, dark bg + gold primary

"make it feel modern / minimal" →
  Apply bright-minimal theme OR: bordered cards, Inter/DM Sans, none borderRadius, clean colors

"make it bold / energetic / athletic" →
  Apply bold-athletic theme OR: Oswald font, black weight, no border radius, flat cards, tight spacing

"make it more professional" →
  Apply corporate-navy theme OR: bordered cards, DM Sans, sm borderRadius, navy colors

"make it softer / friendlier" →
  xl borderRadius, elevated cards, Montserrat font, warmer colors, relaxed spacing

"add animations" → set globalStyle.animations: true

"make it bigger / more spacious" → sectionSpacing: "relaxed"

"make it more compact / tighter" → sectionSpacing: "compact"

"glassmorphism / glass look" → cardStyle: "glass" (works best on dark backgrounds)

═══════════════════════════════════════════════════════════
## AVAILABLE THEMES (for apply_theme tool)
═══════════════════════════════════════════════════════════

- **dark-luxury**: Deep black + gold, glass cards, Playfair Display, relaxed spacing
- **bright-minimal**: White + black, bordered cards, Inter, clean
- **bold-athletic**: Black + red, Oswald, no radius, compact — perfect for gyms
- **ocean-blue**: Deep navy + cyan, glass cards, Montserrat
- **sunset-orange**: Dark brown + orange, Oswald, warm
- **forest-green**: Dark green + lime (current default)
- **midnight-purple**: Dark purple + violet, glass, Space Grotesk
- **corporate-navy**: Navy + blue, bordered, DM Sans, professional
- **rose-gold**: Dark purple + pink/gold, glass, Playfair Display
- **monochrome**: Pure black/white, Bebas Neue, ultra minimal

═══════════════════════════════════════════════════════════
## TOOLS GUIDE
═══════════════════════════════════════════════════════════

- **patch_content**: For targeted edits (1-5 field changes). Fast and surgical. PREFER THIS for small changes.
- **update_content**: For full redesigns, adding/removing sections, or when 6+ fields change.
- **apply_theme**: For instant complete visual transformations.
- **search_images**: Find image URLs to use in imageUrl fields (hero, gallery, team avatars, section backgrounds).
- **list_snapshots** / **restore_snapshot**: Version history and undo.

═══════════════════════════════════════════════════════════
## RULES
═══════════════════════════════════════════════════════════

1. For small changes (color, text, single field), use patch_content — no need to get_current_content first.
2. For complex changes, always call get_current_content first to see the latest state.
3. When updating, always pass the FULL content JSON to update_content (not partial).
4. When adding new sections, give them unique lowercase hyphenated ids.
5. Keep responses concise. After making a change, briefly say what you did.
6. Report the githubStatus from tool results.
7. When the user asks to undo or go back, use list_snapshots then restore_snapshot.
8. Nav links auto-generate from visible sections (hero and cta_banner types are excluded).
9. For images, use search_images to find URLs, then set them with patch_content.
10. The globalCSS field accepts any valid CSS — use it for effects the schema doesn't cover.`;
}

// ── Route Handler ──────────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ response: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local" }, { status: 500 });
  }
  const client = new OpenAI({ apiKey });

  let currentContent: Record<string, unknown>;
  try {
    currentContent = getContent();
  } catch {
    return NextResponse.json({ response: "Could not read site content. Make sure content/current.json exists." }, { status: 500 });
  }

  const systemPrompt = buildSystemPrompt(currentContent);

  const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    let response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 8192,
      tools,
      messages: apiMessages,
    });

    let contentChanged = false;
    const allMessages = [...apiMessages];

    while (response.choices[0].finish_reason === "tool_calls") {
      const assistantMessage = response.choices[0].message;
      const toolCalls = assistantMessage.tool_calls ?? [];
      allMessages.push(assistantMessage);

      const toolResults: OpenAI.Chat.ChatCompletionToolMessageParam[] = [];

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") continue;
        const args = JSON.parse(toolCall.function.arguments);
        let result: string;

        switch (toolCall.function.name) {
          case "get_current_content":
            result = JSON.stringify(getContent());
            break;

          case "update_content": {
            const githubStatus = await saveContent(args.content ?? args);
            contentChanged = true;
            result = JSON.stringify({ success: true, message: "Content updated successfully", githubStatus });
            break;
          }

          case "patch_content": {
            try {
              const { content: updatedContent, result: githubStatus } = await patchContent(args.patches);
              contentChanged = true;
              result = JSON.stringify({ success: true, message: `Applied ${args.patches.length} patch(es)`, githubStatus, updatedFields: args.patches.map((p: any) => p.path) });
            } catch (e: any) {
              result = JSON.stringify({ success: false, error: e.message });
            }
            break;
          }

          case "apply_theme": {
            const themeName = args.theme as string;
            const theme = THEMES[themeName];
            if (!theme) {
              result = JSON.stringify({ success: false, error: `Unknown theme: ${themeName}. Available: ${Object.keys(THEMES).join(", ")}` });
              break;
            }
            const existing = getContent() as Record<string, unknown>;
            const updated = args.preserve_content !== false
              ? { ...existing, ...theme, sections: existing.sections }
              : { ...existing, ...theme };
            const githubStatus = await saveContent(updated);
            contentChanged = true;
            result = JSON.stringify({ success: true, message: `Applied theme: ${themeName}`, githubStatus });
            break;
          }

          case "search_images": {
            const images = await searchImages(args.query, args.count ?? 5);
            result = JSON.stringify({ images, note: process.env.UNSPLASH_ACCESS_KEY ? "Unsplash results" : "Placeholder images (add UNSPLASH_ACCESS_KEY for real photos)" });
            break;
          }

          case "list_snapshots":
            result = JSON.stringify(getSnapshots());
            break;

          case "restore_snapshot": {
            const success = restoreSnapshot(args.filename);
            if (success) contentChanged = true;
            result = JSON.stringify({ success, message: success ? "Snapshot restored" : "Snapshot not found" });
            break;
          }

          default:
            result = JSON.stringify({ error: "Unknown tool" });
        }

        toolResults.push({ role: "tool", tool_call_id: toolCall.id, content: result });
      }

      allMessages.push(...toolResults);
      response = await client.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 8192,
        tools,
        messages: allMessages,
      });
    }

    const text = response.choices[0].message.content;
    return NextResponse.json({ response: text || "Done! Changes applied.", changed: contentChanged });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("insufficient_quota") || errorMessage.includes("billing")) {
      return NextResponse.json({ response: "⚠️ OpenAI API quota exceeded. Visit platform.openai.com to add credits." });
    }
    return NextResponse.json({ response: `Something went wrong: ${errorMessage}` });
  }
}
