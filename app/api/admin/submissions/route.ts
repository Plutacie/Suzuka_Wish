import { NextResponse } from "next/server";
import { listSubmissions } from "@/lib/submissions";

function unauthorized() {
  return NextResponse.json({ error: "未授权" }, { status: 401 });
}

export async function GET(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "未配置 ADMIN_SECRET" }, { status: 503 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key || key !== secret) {
    return unauthorized();
  }

  try {
    const rows = await listSubmissions();
    return NextResponse.json({ submissions: rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "REDIS_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "服务器未配置存储" },
        { status: 503 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}
