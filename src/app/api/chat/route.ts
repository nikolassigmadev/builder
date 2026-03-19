import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const BUNDLED_CURRENT_PATH = path.join(process.cwd(), "content", "current.json");
const TMP_DIR = "/tmp/content";
const TMP_CURRENT_PATH = path.join(TMP_DIR, "current.json");
const TMP_HISTORY_DIR = path.join(TMP_DIR, "history");

function getContent() {
  // Check /tmp first (has latest changes made during this session)
  if (fs.existsSync(TMP_CURRENT_PATH)) {
    return JSON.parse(fs.readFileSync(TMP_CURRENT_PATH, "utf-8"));
  }
  return JSON.parse(fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8"));
}

async function saveContent(content: Record<string, unknown>): Promise<string> {
  // Ensure /tmp dirs exist
  if (!fs.existsSync(TMP_HISTORY_DIR)) {
    fs.mkdirSync(TMP_HISTORY_DIR, { recursive: true });
  }

  // Snapshot current before overwriting
  const current = fs.existsSync(TMP_CURRENT_PATH)
    ? fs.readFileSync(TMP_CURRENT_PATH, "utf-8")
    : fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(TMP_HISTORY_DIR, `${timestamp}.json`), current);

  // Write new content to /tmp
  const newContent = JSON.stringify(content, null, 2);
  fs.writeFileSync(TMP_CURRENT_PATH, newContent);

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
  if (!getRes.ok) return `warning: GitHub sync failed (could not get file SHA: ${getRes.status})`;
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
  if (!fs.existsSync(TMP_HISTORY_DIR)) return [];
  return fs
    .readdirSync(TMP_HISTORY_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .map((f) => ({ filename: f, timestamp: f.replace(".json", "") }));
}

function restoreSnapshot(filename: string) {
  const snapshotPath = path.join(TMP_HISTORY_DIR, filename);
  if (!fs.existsSync(snapshotPath)) return false;

  if (!fs.existsSync(TMP_HISTORY_DIR)) {
    fs.mkdirSync(TMP_HISTORY_DIR, { recursive: true });
  }

  // Snapshot current before restoring
  const current = fs.existsSync(TMP_CURRENT_PATH)
    ? fs.readFileSync(TMP_CURRENT_PATH, "utf-8")
    : fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(TMP_HISTORY_DIR, `${timestamp}.json`), current);

  // Restore
  const snapshot = fs.readFileSync(snapshotPath, "utf-8");
  fs.writeFileSync(TMP_CURRENT_PATH, snapshot);
  return true;
}

const tools: Anthropic.Tool[] = [
  {
    name: "get_current_content",
    description:
      "Get the current website content as JSON. Use this to see what the site currently looks like before making changes.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "update_content",
    description:
      "Update website content. Provide the full updated content JSON. You must first call get_current_content, then modify the fields the user wants changed, then pass the full updated object here.",
    input_schema: {
      type: "object" as const,
      properties: {
        content: {
          type: "object" as const,
          description: "The full updated content JSON object",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "list_snapshots",
    description:
      "List all saved snapshots/versions of the website. Each snapshot is a previous state that can be restored.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "restore_snapshot",
    description:
      "Restore the website to a previous snapshot. Use list_snapshots first to find the right one.",
    input_schema: {
      type: "object" as const,
      properties: {
        filename: {
          type: "string" as const,
          description: "The snapshot filename to restore (e.g., '2026-03-19T14-00-00-000Z.json')",
        },
      },
      required: ["filename"],
    },
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ response: "API key not configured. Check .env.local" }, { status: 500 });
  }
  const client = new Anthropic({ apiKey });

  let currentContent: Record<string, unknown>;
  try {
    currentContent = getContent();
  } catch {
    return NextResponse.json({ response: "Could not read site content. Make sure content/current.json exists on the server." }, { status: 500 });
  }

  const systemPrompt = `You are a friendly website editor assistant for a gym website. The user will ask you to make changes to their website content, and you have tools to do so.

Current website content:
${JSON.stringify(currentContent, null, 2)}

IMPORTANT RULES:
- Always call get_current_content first before making any changes, to ensure you have the latest state.
- When updating content, modify only the fields the user asks about and keep everything else the same.
- After making changes, confirm what you changed in a clear, friendly way.
- If the user asks to undo or go back, use list_snapshots and restore_snapshot.
- If the user asks something you can't do with the available tools, let them know politely.
- Keep responses concise and helpful.
- The site colors can be changed via the "colors" object (primary, secondary, accent, background, text).
- Classes, pricing plans, and testimonials are arrays that can be added to, removed from, or modified.`;

  const apiMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    let response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages: apiMessages,
    });

    // Handle tool use loop
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUseBlocks) {
        let result: string;

        switch (toolUse.name) {
          case "get_current_content":
            result = JSON.stringify(getContent());
            break;
          case "update_content": {
            const input = toolUse.input as { content: Record<string, unknown> };
            const githubStatus = await saveContent(input.content);
            result = JSON.stringify({ success: true, message: "Content updated successfully", githubStatus });
            break;
          }
          case "list_snapshots":
            result = JSON.stringify(getSnapshots());
            break;
          case "restore_snapshot": {
            const snapInput = toolUse.input as { filename: string };
            const success = restoreSnapshot(snapInput.filename);
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
          type: "tool_result" as const,
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages: [
          ...apiMessages,
          { role: "assistant" as const, content: response.content },
          { role: "user" as const, content: toolResults },
        ],
      });
    }

    // Extract text response
    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );

    return NextResponse.json({
      response: textBlock?.text || "Done! Refresh the site to see your changes.",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("credit balance")) {
      return NextResponse.json({
        response: "⚠️ Your Anthropic API account needs more credits. Please visit console.anthropic.com to add credits, then try again.",
      });
    }
    return NextResponse.json({
      response: `Something went wrong: ${errorMessage}`,
    });
  }
}
