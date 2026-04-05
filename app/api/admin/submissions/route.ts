import { NextResponse } from "next/server";
import { listSubmissions } from "@/lib/submissions";

export async function GET() {
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
