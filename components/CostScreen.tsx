"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

function CostInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) {
        setError("缺少会话，请从首页重新填写心愿。");
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, costAnswer: text }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          setError(data.error ?? "提交失败");
          return;
        }
        setDone(true);
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    },
    [id, text]
  );

  if (!id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-red-500">链接无效。</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 text-sm text-red-400 underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-serif">
        <p className="text-xl text-red-500 md:text-2xl">契约已成。</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-10 text-sm text-red-400/80 underline"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 font-serif">
      <h1 className="mb-10 text-center text-3xl font-bold tracking-widest text-red-600 md:text-4xl">
        那么代价是什么？
      </h1>
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-md flex-col gap-4"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="rounded-lg border border-red-900/60 bg-black px-4 py-3 text-red-100 outline-none ring-red-900/40 placeholder:text-red-900/80 focus:border-red-700 focus:ring-2"
          placeholder="在这里写下你的回答…"
          required
        />
        {error ? (
          <p className="text-center text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-red-700 bg-red-950/40 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-950/70 disabled:opacity-50"
        >
          {loading ? "提交中…" : "提交"}
        </button>
      </form>
    </div>
  );
}

export default function CostScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-red-600">
          …
        </div>
      }
    >
      <CostInner />
    </Suspense>
  );
}
