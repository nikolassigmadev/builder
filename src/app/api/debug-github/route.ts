import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return NextResponse.json({ error: "Missing env vars", token: !!token, repo: !!repo });
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/content/current.json`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const body = await res.json();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      sha: body.sha ?? null,
      error: body.message ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
