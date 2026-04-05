import { NextResponse } from "next/server";
import { setCostAnswer } from "@/lib/submissions";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: string; costAnswer?: string };
    const id = (body.id ?? "").trim();
    const costAnswer = (body.costAnswer ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "缺少记录" }, { status: 400 });
    }

    if (!costAnswer) {
      return NextResponse.json({ error: "请填写内容" }, { status: 400 });
    }

    const row = await setCostAnswer(id, costAnswer);
    if (!row) {
      return NextResponse.json(
        {
          error:
            "找不到对应的心愿记录（链接可能过期或环境不一致），请从首页重新填写。",
        },
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
