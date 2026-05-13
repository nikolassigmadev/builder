import crypto from "crypto";

export const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET env var must be set and at least 32 characters");
  }
  return s;
}

export function createSessionToken(): string {
  const expires = (Date.now() + SESSION_DURATION_MS).toString(10);
  const sig = crypto.createHmac("sha256", secret()).update(expires).digest("hex");
  return Buffer.from(`${expires}:${sig}`).toString("base64url");
}

export function verifySessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const colon = decoded.indexOf(":");
    if (colon === -1) return false;

    const expires = decoded.slice(0, colon);
    const sig = decoded.slice(colon + 1);

    const expected = crypto.createHmac("sha256", secret()).update(expires).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");

    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    return Date.now() < parseInt(expires, 10);
  } catch {
    return false;
  }
}
