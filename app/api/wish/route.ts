import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/submissions";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      shortWish?: string;
      longWish?: string;
    };
    const name = (body.name ?? "").trim();
    const shortWish = (body.shortWish ?? "").trim();
    const longWish = (body.longWish ?? "").trim();

    if (!name || !shortWish || !longWish) {
      return NextResponse.json(
        { error: "请填写姓名与两个心愿" },
        { status: 400 }
      );
    }

    const row = await createSubmission({ name, shortWish, longWish });
    return NextResponse.json({ id: row.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "REDIS_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "服务器未配置存储（请在 Vercel 中接入 Upstash Redis 并设置环境变量）",
        },
        { status: 503 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
