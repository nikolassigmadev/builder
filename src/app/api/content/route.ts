import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const BUNDLED_CURRENT_PATH = path.join(process.cwd(), "content", "current.json");
const TMP_DIR = "/tmp/content";
const TMP_CURRENT_PATH = path.join(TMP_DIR, "current.json");
const TMP_HISTORY_DIR = path.join(TMP_DIR, "history");

function getContent() {
  if (fs.existsSync(TMP_CURRENT_PATH)) {
    return JSON.parse(fs.readFileSync(TMP_CURRENT_PATH, "utf-8"));
  }
  return JSON.parse(fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8"));
}

export async function GET() {
  const content = getContent();
  return NextResponse.json(content);
}

export async function PUT(req: Request) {
  const newContent = await req.json();

  if (!fs.existsSync(TMP_HISTORY_DIR)) {
    fs.mkdirSync(TMP_HISTORY_DIR, { recursive: true });
  }

  const current = fs.existsSync(TMP_CURRENT_PATH)
    ? fs.readFileSync(TMP_CURRENT_PATH, "utf-8")
    : fs.readFileSync(BUNDLED_CURRENT_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(TMP_HISTORY_DIR, `${timestamp}.json`), current);

  fs.writeFileSync(TMP_CURRENT_PATH, JSON.stringify(newContent, null, 2));

  revalidatePath("/");

  return NextResponse.json({ success: true });
}
