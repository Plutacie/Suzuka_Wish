"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import confetti from "canvas-confetti";

function burstFireworks() {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ["#b8860b", "#1a1510", "#d4af37", "#f5eed9", "#8b6914"],
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

const ADMIN_TAP_WINDOW_MS = 2500;
const ADMIN_TAPS_NEEDED = 5;

export default function WishForm() {
  const router = useRouter();
  const adminTapRef = useRef({ count: 0, at: 0 });
  const [name, setName] = useState("");
  const [shortWish, setShortWish] = useState("");
  const [longWish, setLongWish] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/wish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, shortWish, longWish }),
        });
        const data = (await res.json()) as { id?: string; error?: string };
        if (!res.ok) {
          setError(data.error ?? "提交失败");
          return;
        }
        if (!data.id) {
          setError("提交异常");
          return;
        }
        burstFireworks();
        setTimeout(() => {
          router.push(`/cost?id=${encodeURIComponent(data.id!)}`);
        }, 450);
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    },
    [name, shortWish, longWish, router]
  );

  const onTitlePointerDown = useCallback(() => {
    const now = Date.now();
    const w = adminTapRef.current;
    if (now - w.at > ADMIN_TAP_WINDOW_MS) w.count = 0;
    w.at = now;
    w.count += 1;
    if (w.count >= ADMIN_TAPS_NEEDED) {
      w.count = 0;
      router.push("/admin");
    }
  }, [router]);

  return (
    <form
      onSubmit={onSubmit}
      className="relative z-10 mx-auto flex max-w-lg flex-col gap-7 px-5 py-14 font-serif md:px-6 md:py-16"
    >
      <header className="text-center">
        <div className="mx-auto mb-3 h-px w-24 bg-gradient-to-r from-transparent via-[#b8860b] to-transparent" />
        <h1
          className="cursor-default select-none text-[1.65rem] font-semibold tracking-[0.35em] text-[#1a1510] md:text-3xl md:tracking-[0.4em]"
          onPointerDown={onTitlePointerDown}
        >
          心愿
        </h1>
        <p className="mt-3 text-sm tracking-wide text-[#3d3428]">
          写下你的名字与两个心愿
        </p>
        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-[#b8860b] to-transparent" />
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5c4d3c]">
          姓名
        </span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-sm border-2 border-[#1a1510]/85 bg-[#faf6ed] px-4 py-3 text-[#1a1510] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none ring-0 placeholder:text-[#8a7a68] focus:border-[#b8860b] focus:shadow-[0_0_0_1px_rgba(184,134,11,0.35),inset_0_1px_0_rgba(255,255,255,0.6)]"
          placeholder="怎么称呼你"
          autoComplete="name"
          required
        />
      </label>

      <div className="grid gap-5 md:grid-cols-1">
        <label className="flex flex-col gap-2 rounded-sm border-2 border-[#8b6914]/55 bg-[#f4ecdc]/90 p-5 shadow-[inset_0_0_0_1px_rgba(26,21,16,0.08),0_2px_8px_rgba(26,21,16,0.06)]">
          <span className="text-sm font-semibold tracking-wide text-[#6b5a1e]">
            <span className="mr-1.5 text-[#b8860b]">◆</span>
            很快就能被完成的心愿
          </span>
          <textarea
            name="shortWish"
            value={shortWish}
            onChange={(e) => setShortWish(e.target.value)}
            rows={4}
            className="mt-1 resize-y rounded-sm border border-[#1a1510]/25 bg-[#faf6ed] px-3 py-2.5 text-sm leading-relaxed text-[#1a1510] outline-none placeholder:text-[#8a7a68] focus:border-[#b8860b]/80 focus:ring-1 focus:ring-[#b8860b]/30"
            placeholder="一件你希望不久就能实现的事…"
            required
          />
        </label>

        <label className="flex flex-col gap-2 rounded-sm border-2 border-[#1a1510]/35 bg-[#efe6d4]/95 p-5 shadow-[inset_0_0_0_1px_rgba(184,134,11,0.2),0_2px_8px_rgba(26,21,16,0.07)]">
          <span className="text-sm font-semibold tracking-wide text-[#1a1510]">
            <span className="mr-1.5 text-[#b8860b]">◆</span>
            长久的心愿
          </span>
          <textarea
            name="longWish"
            value={longWish}
            onChange={(e) => setLongWish(e.target.value)}
            rows={4}
            className="mt-1 resize-y rounded-sm border border-[#1a1510]/25 bg-[#faf6ed] px-3 py-2.5 text-sm leading-relaxed text-[#1a1510] outline-none placeholder:text-[#8a7a68] focus:border-[#b8860b]/80 focus:ring-1 focus:ring-[#b8860b]/30"
            placeholder="更远、更久一点的愿望…"
            required
          />
        </label>
      </div>

      {error ? (
        <p
          className="text-center text-sm text-[#7f1d1d]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-sm border-2 border-[#1a1510] bg-[#1a1510] px-6 py-3.5 text-center text-sm font-semibold tracking-[0.25em] text-[#e8d5a3] shadow-[0_2px_0_#5c4d3c,inset_0_1px_0_rgba(212,175,55,0.25)] transition hover:bg-[#2a241c] hover:text-[#f0e4c8] disabled:opacity-50"
      >
        {loading ? "提交中…" : "许下心愿"}
      </button>
    </form>
  );
}
