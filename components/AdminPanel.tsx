"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Submission = {
  id: string;
  name: string;
  shortWish: string;
  longWish: string;
  costAnswer: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPanel() {
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    setRows(null);
    try {
      const res = await fetch("/api/admin/submissions");
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
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 font-serif">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-200">全部提交</h1>
          <p className="mt-2 text-sm text-zinc-500">
            从首页连点「心愿」五次进入此处；请勿分享
            <code className="mx-1 text-zinc-400">/admin</code>
            链接。
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="text-zinc-400 underline decoration-zinc-600 underline-offset-2 hover:text-zinc-200 disabled:opacity-50"
          >
            刷新
          </button>
          <Link
            href="/"
            className="text-zinc-400 underline decoration-zinc-600 underline-offset-2 hover:text-zinc-200"
          >
            回首页
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-zinc-500">加载中…</p>
      ) : null}

      {error ? (
        <p className="mt-10 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && rows && rows.length === 0 ? (
        <p className="mt-10 text-zinc-500">暂无提交记录。</p>
      ) : null}

      {!loading && !error && rows && rows.length > 0 ? (
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
