import WishForm from "@/components/WishForm";

export default function Home() {
  return (
    <main className="home-retro relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-6 rounded-sm border border-[#8b6914]/25 md:inset-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[1.35rem] rounded-sm border border-[#1a1510]/20 md:inset-[2.35rem]"
        aria-hidden
      />
      <WishForm />
    </main>
  );
}
