"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Submission = {
  id: string;
  name: string;
  shortWish: string;
  longWish: string;
  costAnswer: string | null;
  createdAt: string;
  updatedAt: string;
};

function AdminInner() {
  const searchParams = useSearchParams();
  const keyFromUrl = searchParams.get("key") ?? "";
  const [key, setKey] = useState(keyFromUrl);
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (k: string) => {
    setError(null);
    setLoading(true);
    setRows(null);
    try {
      const res = await fetch(
        `/api/admin/submissions?key=${encodeURIComponent(k)}`
      );
      const data = (await res.json()) as {
        submissions?: Submission[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "无法读取");
        return;
      }
      setRows(data.submissions ?? []);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const k = keyFromUrl.trim();
    if (k) void load(k);
  }, [keyFromUrl, load]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void load(key.trim());
    },
    [key, load]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 font-serif">
      <h1 className="text-xl font-semibold text-zinc-200">管理入口</h1>
      <p className="mt-2 text-sm text-zinc-500">
        使用部署时配置的 <code className="text-zinc-400">ADMIN_SECRET</code>{" "}
        作为密钥查看全部提交。
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 outline-none focus:border-zinc-500"
          placeholder="管理密钥"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="rounded-lg bg-zinc-700 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          {loading ? "加载中…" : "查看"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {rows && rows.length === 0 ? (
        <p className="mt-8 text-zinc-500">暂无提交记录。</p>
      ) : null}

      {rows && rows.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-6">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-300"
            >
              <p className="text-xs text-zinc-500">
                {r.createdAt}
                {r.updatedAt !== r.createdAt ? ` · 更新 ${r.updatedAt}` : ""}
              </p>
              <p className="mt-2 font-medium text-zinc-100">姓名：{r.name}</p>
              <p className="mt-3 text-fuchsia-200/90">
                很快的心愿：{r.shortWish}
              </p>
              <p className="mt-2 text-violet-200/90">长久的心愿：{r.longWish}</p>
              <p className="mt-3 border-t border-zinc-800 pt-3 text-red-400/90">
                代价：{r.costAnswer ?? "（未填写）"}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function AdminPanel() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-500">加载…</p>}>
      <AdminInner />
    </Suspense>
  );
}
