import { NextResponse } from "next/server";
import { setCostAnswer } from "@/lib/submissions";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: string; costAnswer?: string };
    const id = (body.id ?? "").trim();
    const costAnswer = body.costAnswer ?? "";

    if (!id) {
      return NextResponse.json({ error: "缺少记录" }, { status: 400 });
    }

    const row = await setCostAnswer(id, costAnswer);
    if (!row) {
      return NextResponse.json(
        { error: "记录不存在或内容为空" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "REDIS_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "服务器未配置存储" },
        { status: 503 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
