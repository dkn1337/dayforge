import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="panel w-full max-w-lg rounded-[24px] p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#a98fff]/30 bg-[#8066ff]/15 text-[#c7bcff]">
          <Compass className="size-6" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#a98fff]">Błąd 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-white">Ta przestrzeń nie istnieje.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#a6afc8]">Wróć do dashboardu i kontynuuj projektowanie lepszego dnia.</p>
        <Link className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#8066ff,#4e9cff)] px-4 text-sm font-semibold text-white shadow-[0_13px_30px_rgba(109,83,255,.24)] transition hover:-translate-y-0.5 hover:brightness-110" href="/today">
          <ArrowLeft className="size-4" />
          Wróć do dzisiaj
        </Link>
      </section>
    </main>
  );
}
