import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const BUNDLED_CURRENT_PATH = path.join(process.cwd(), "content", "current.json");
const TMP_DIR = "/tmp/content";
const TMP_CURRENT_PATH = path.join(TMP_DIR, "current.json");
const TMP_HISTORY_DIR = path.join(TMP_DIR, "history");

// Use the real project path when writable (localhost), fall back to /tmp (read-only hosts)
function isProjectWritable() {
  try {
    fs.accessSync(path.dirname(BUNDLED_CURRENT_PATH), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function getActivePaths() {
  if (isProjectWritable()) {
    const historyDir = path.join(process.cwd(), "content", "history");
    return { currentPath: BUNDLED_CURRENT_PATH, historyDir };
  }
  return { currentPath: TMP_CURRENT_PATH, historyDir: TMP_HISTORY_DIR };
}

function getContent() {
  const { currentPath } = getActivePaths();
  // On read-only hosts, /tmp may not have the file yet — fall back to bundled
  if (currentPath === TMP_CURRENT_PATH && !fs.existsSync(TMP_CURRENT_PATH)) {
    return JSON.parse(fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8"));
  }
  return JSON.parse(fs.readFileSync(currentPath, "utf-8"));
}

async function saveContent(content: Record<string, unknown>): Promise<string> {
  const { currentPath, historyDir } = getActivePaths();

  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

  // Snapshot current before overwriting
  const current = fs.existsSync(currentPath)
    ? fs.readFileSync(currentPath, "utf-8")
    : fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(historyDir, `${timestamp}.json`), current);

  // Write new content
  const newContent = JSON.stringify(content, null, 2);
  fs.writeFileSync(currentPath, newContent);

  // Push to GitHub
  const githubResult = await pushToGitHub(newContent);
  return githubResult;
}

async function pushToGitHub(newContent: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return "warning: GITHUB_TOKEN or GITHUB_REPO not set — change saved temporarily but will not persist after server restart";

  const apiUrl = `https://api.github.com/repos/${repo}/contents/content/current.json`;

  // Get current SHA (required for updates)
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!getRes.ok) {
    const body = await getRes.text();
    console.error("GitHub GET failed:", getRes.status, body);
    return `warning: GitHub sync failed (could not get file SHA: ${getRes.status} — ${body})`;
  }
  const { sha } = await getRes.json();

  // Push updated file
  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "chore: update site content via admin panel",
      content: Buffer.from(newContent).toString("base64"),
      sha,
    }),
  });

  if (!putRes.ok) return `warning: GitHub sync failed (${putRes.status}) — change is temporary`;
  return "success: saved to GitHub, Vercel will redeploy in ~30 seconds";
}

function getSnapshots() {
  const { historyDir } = getActivePaths();
  if (!fs.existsSync(historyDir)) return [];
  return fs
    .readdirSync(historyDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .map((f) => ({ filename: f, timestamp: f.replace(".json", "") }));
}

function restoreSnapshot(filename: string) {
  const { currentPath, historyDir } = getActivePaths();
  const snapshotPath = path.join(historyDir, filename);
  if (!fs.existsSync(snapshotPath)) return false;

  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

  // Snapshot current before restoring
  const current = fs.existsSync(currentPath)
    ? fs.readFileSync(currentPath, "utf-8")
    : fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(historyDir, `${timestamp}.json`), current);

  // Restore
  const snapshot = fs.readFileSync(snapshotPath, "utf-8");
  fs.writeFileSync(currentPath, snapshot);
  return true;
}

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_current_content",
      description:
        "Get the current website content as JSON. Use this to see what the site currently looks like before making changes.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "update_content",
      description:
        "Update website content. Provide the full updated content JSON. You must first call get_current_content, then modify the fields the user wants changed, then pass the full updated object here.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "object",
            description: "The full updated content JSON object",
          },
        },
        required: ["content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_snapshots",
      description:
        "List all saved snapshots/versions of the website. Each snapshot is a previous state that can be restored.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "restore_snapshot",
      description:
        "Restore the website to a previous snapshot. Use list_snapshots first to find the right one.",
      parameters: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "The snapshot filename to restore (e.g., '2026-03-19T14-00-00-000Z.json')",
          },
        },
        required: ["filename"],
      },
    },
  },
];

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
    return NextResponse.json({ response: "Could not read site content. Make sure content/current.json exists on the server." }, { status: 500 });
  }

  const systemPrompt = `You are a powerful website editor assistant. The user can ask you to make ANY change to their website — add sections, remove sections, reorder them, edit content, change colors, and more. You have full control.

Current website content:
${JSON.stringify(currentContent, null, 2)}

## ARCHITECTURE
The site uses a sections-based system. The content JSON has:
- "siteTitle": the site name shown in nav and footer
- "colors": { primary, secondary, accent, background, text } — controls the entire color scheme
- "nav": { ctaText, ctaLink } — the navigation call-to-action button
- "footer": { tagline, socialLinks } — footer content
- "sections": an ordered array of section objects that render top-to-bottom

Each section has: { "id": "unique-id", "type": "section_type", "visible": true/false, "data": { ... } }

## AVAILABLE SECTION TYPES & THEIR DATA SHAPES

1. **hero** — Full-screen hero with headline, CTA buttons, and optional stats
   data: { badge?, headline, subheadline, ctaText?, ctaLink?, secondaryCtaText?, secondaryCtaLink?, stats?: [{value, label}] }

2. **about** — Split layout with text + stats grid
   data: { label?, title, description, ctaText?, ctaLink?, stats?: [{value, label}] }

3. **classes** — Grid of class/service cards with icons, schedule
   data: { label?, title, items: [{ name, icon?, time?, days?, description }] }

4. **pricing** — Pricing plan cards (up to ~4)
   data: { label?, title, plans: [{ name, price, period, features: string[], popular?: boolean }] }

5. **testimonials** — Customer testimonial cards with stars
   data: { label?, title, items: [{ name, text, role }] }

6. **contact** — Contact info + form
   data: { label?, title, address?, phone?, email?, hours?, submitText?, formFields?: [{name, label, type, placeholder}] }

7. **features** — Grid of feature/benefit cards with icons
   data: { label?, title, subtitle?, columns?: 2|3|4, items: [{ icon?, title, description }] }

8. **faq** — Frequently asked questions list
   data: { label?, title, items: [{ question, answer }] }

9. **cta_banner** — Full-width call-to-action banner (uses primary color as background)
   data: { title, description?, ctaText?, ctaLink? }

10. **team** — Team member cards with avatar initials
    data: { label?, title, columns?: 2|3|4, members: [{ name, role, bio? }] }

11. **text_block** — Freeform text content section
    data: { label?, title?, content, alignment?: "left"|"center"|"right", bgColor?: "secondary", ctaText?, ctaLink? }

12. **stats** — Standalone statistics/numbers section
    data: { title?, columns?: 2|3|4, items: [{ value, label }] }

13. **gallery** — Image/placeholder grid
    data: { label?, title, columns?: 2|3|4, items: [{ icon?, caption?, imageUrl? }] }

## WHAT YOU CAN DO
- **Add new sections**: Insert a new section object into the sections array at any position
- **Remove sections**: Remove any section from the array
- **Reorder sections**: Change the order of sections in the array
- **Hide/show sections**: Set visible to true or false
- **Edit any content**: Modify any field in any section's data
- **Change colors**: Modify the colors object
- **Change site title**: Modify siteTitle
- **Change nav/footer**: Modify nav and footer objects
- **Add items to arrays**: Add classes, pricing plans, testimonials, features, FAQ items, team members, etc.
- **Remove items from arrays**: Remove specific items from any array
- **Change form fields**: Customize contact form fields via formFields array

## RULES
- Always call get_current_content first before making changes to ensure you have the latest state.
- When updating, pass the FULL updated content JSON (all fields, not just changed ones).
- After changes, always report the githubStatus from the tool result.
- If the user asks to undo or go back, use list_snapshots and restore_snapshot.
- Keep responses concise and helpful.
- When adding a new section, give it a unique id (lowercase, hyphenated).
- The nav links are auto-generated from visible sections (except hero and cta_banner types).`;

  const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    let response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      tools,
      messages: apiMessages,
    });

    let contentChanged = false;

    // Handle tool call loop
    while (response.choices[0].finish_reason === "tool_calls") {
      const assistantMessage = response.choices[0].message;
      const toolCalls = assistantMessage.tool_calls ?? [];

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
          case "list_snapshots":
            result = JSON.stringify(getSnapshots());
            break;
          case "restore_snapshot": {
            const success = restoreSnapshot(args.filename);
            if (success) contentChanged = true;
            result = JSON.stringify({
              success,
              message: success ? "Snapshot restored successfully" : "Snapshot not found",
            });
            break;
          }
          default:
            result = JSON.stringify({ error: "Unknown tool" });
        }

        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 4096,
        tools,
        messages: [
          ...apiMessages,
          assistantMessage,
          ...toolResults,
        ],
      });
    }

    const text = response.choices[0].message.content;

    return NextResponse.json({
      response: text || "Done! Refresh the site to see your changes.",
      changed: contentChanged,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("insufficient_quota") || errorMessage.includes("billing")) {
      return NextResponse.json({
        response: "⚠️ Your OpenAI API account needs more credits. Please visit platform.openai.com to add credits, then try again.",
      });
    }
    return NextResponse.json({
      response: `Something went wrong: ${errorMessage}`,
    });
  }
}
