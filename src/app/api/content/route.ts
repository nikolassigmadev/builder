import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const CONTENT_DIR = path.join(process.cwd(), "content");
const CURRENT_PATH = path.join(CONTENT_DIR, "current.json");
const HISTORY_DIR = path.join(CONTENT_DIR, "history");

export async function GET() {
  const content = JSON.parse(fs.readFileSync(CURRENT_PATH, "utf-8"));
  return NextResponse.json(content);
}

export async function PUT(req: Request) {
  const newContent = await req.json();

  // Snapshot current state before overwriting
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }

  const current = fs.readFileSync(CURRENT_PATH, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(HISTORY_DIR, `${timestamp}.json`), current);

  // Write new content
  fs.writeFileSync(CURRENT_PATH, JSON.stringify(newContent, null, 2));

  return NextResponse.json({ success: true });
}
