import { NextResponse } from "next/server";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: Request) {
  const { password } = await req.json();

  const hashedInput = hashPassword(password);
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  if (hashedInput === storedHash) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
