"use client";

import { ArrowLeft, CheckCircle2, Cloud, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getSupabaseSetupHint } from "@/lib/supabase/config";

type AuthMode = "signin" | "signup" | "reset";

export function AuthScreen() {
  const { isCloudConfigured, isLoading, session, signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const title = mode === "signin" ? "Witaj ponownie" : mode === "signup" ? "Stwórz swoją przestrzeń" : "Odzyskaj dostęp";
  const description = mode === "signin" ? "Zaloguj się, aby pobrać własny workspace DayForge." : mode === "signup" ? "Jedno konto. Twoje dane na każdym komputerze." : "Wyślemy wiadomość z instrukcją ustawienia nowego hasła.";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const result = mode === "signin"
      ? await signIn(email, password)
      : mode === "signup"
        ? await signUp(displayName, email, password)
        : await sendPasswordReset(email);
    setBusy(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (mode === "signup" && result.needsEmailConfirmation) {
      toast.success("Konto utworzone. Potwierdź adres e-mail, a potem zaloguj się w DayForge.");
      setMode("signin");
      return;
    }

    if (mode === "reset") {
      toast.success("Wiadomość do resetu hasła została wysłana.");
      setMode("signin");
      return;
    }

    toast.success("Zalogowano. Otwieramy Twoją przestrzeń.");
  };

  if (session) {
    return <AuthSuccess />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(circle_at_25%_20%,rgba(128,102,255,.2),transparent_36%),radial-gradient(circle_at_75%_0%,rgba(78,156,255,.16),transparent_32%)]" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1223]/80 shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-xl lg:grid-cols-[1.05fr_.95fr]">
        <div className="hidden min-h-[620px] flex-col justify-between border-r border-white/10 bg-[linear-gradient(145deg,rgba(128,102,255,.16),rgba(78,156,255,.045))] p-10 lg:flex">
          <div>
            <div className="flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.07em] text-white"><span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#a177ff,#4e9cff)] text-base">D</span>Day<span className="text-[#a78aff]">Forge</span></div>
            <div className="mt-20 max-w-sm"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#bdaaff]">Twoje centrum działania</p><h1 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-0.075em] text-white">Buduj dni, które pchają Cię do przodu.</h1><p className="mt-5 text-sm leading-6 text-[#b9c2da]">Zadania, czas, nawyki i skupienie w jednej prywatnej przestrzeni, dostępnej także na drugim komputerze.</p></div>
          </div>
          <div className="grid gap-3"><Trust icon={ShieldCheck} label="Prywatne dane" text="Każdy użytkownik widzi wyłącznie własną przestrzeń." /><Trust icon={Cloud} label="Synchronizacja" text="Po zalogowaniu zapisujemy bezpieczny stan workspace w chmurze." /><Trust icon={Sparkles} label="Bez fałszywych liczb" text="Dashboard liczy tylko Twoje realne działania." /></div>
        </div>
        <div className="p-6 sm:p-10">
          <Link href="/today" className="inline-flex items-center gap-2 text-xs font-semibold text-[#9faacf] transition hover:text-white"><ArrowLeft className="size-3.5" />Wróć do aplikacji lokalnej</Link>
          <div className="mt-10 max-w-sm"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#bdaaff]">DayForge Cloud</p><h2 className="mt-3 text-3xl font-black tracking-[-0.065em] text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-[#9faacf]">{description}</p></div>
          {!isCloudConfigured ? <SetupNotice /> : <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            {mode === "signup" ? <Field label="Jak mamy się do Ciebie zwracać?"><input autoComplete="name" className={inputClass} minLength={2} placeholder="np. Karol" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></Field> : null}
            <Field label="Adres e-mail"><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8490ad]" /><input autoComplete="email" className={`${inputClass} pl-10`} placeholder="ty@przyklad.pl" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div></Field>
            {mode !== "reset" ? <Field label="Hasło"><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8490ad]" /><input autoComplete={mode === "signin" ? "current-password" : "new-password"} className={`${inputClass} pl-10`} minLength={6} placeholder="Minimum 6 znaków" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></div></Field> : null}
            <Button className="mt-2" disabled={busy || isLoading} size="lg" type="submit">{busy ? <LoaderCircle className="size-4 animate-spin" /> : mode === "reset" ? <KeyRound className="size-4" /> : <Cloud className="size-4" />}{mode === "signin" ? "Zaloguj się" : mode === "signup" ? "Utwórz konto" : "Wyślij instrukcję"}</Button>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#8f9bb7]">{mode === "signin" ? <><button className="font-semibold text-[#c3b4ff] hover:text-white" type="button" onClick={() => setMode("signup")}>Nie masz konta? Załóż je</button><button className="hover:text-white" type="button" onClick={() => setMode("reset")}>Nie pamiętasz hasła?</button></> : <button className="font-semibold text-[#c3b4ff] hover:text-white" type="button" onClick={() => setMode("signin")}>Masz już konto? Zaloguj się</button>}</div>
          </form>}
          <p className="mt-8 text-[10px] leading-5 text-[#71809d]">Logując się, akceptujesz prywatny charakter workspace. Nie używamy klucza administracyjnego Supabase w aplikacji użytkownika.</p>
        </div>
      </section>
    </main>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-white outline-none transition placeholder:text-[#71809d] focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-xs font-semibold text-[#c8d0e4]"><span>{label}</span>{children}</label>; }
function Trust({ icon: Icon, label, text }: { icon: typeof ShieldCheck; label: string; text: string }) { return <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0a0e1c]/35 p-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#8066ff]/15 text-[#c3b4ff]"><Icon className="size-4" /></span><span><strong className="block text-xs text-white">{label}</strong><span className="mt-1 block text-[11px] leading-4 text-[#a7b2cc]">{text}</span></span></div>; }
function SetupNotice() { return <div className="mt-8 rounded-2xl border border-[#ffcb62]/25 bg-[#ffcb62]/[0.08] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-[#ffe0a1]"><Cloud className="size-4" />Cloud nie jest jeszcze skonfigurowany</p><p className="mt-2 text-xs leading-5 text-[#d8c9a1]">{getSupabaseSetupHint()}</p><Link className="mt-4 inline-flex h-10 items-center rounded-xl bg-white/10 px-4 text-xs font-semibold text-white transition hover:bg-white/15" href="/today">Użyj DayForge lokalnie</Link></div>; }
function AuthSuccess() { return <main className="grid min-h-screen place-items-center px-4"><section className="panel w-full max-w-md rounded-[28px] p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#42d7a5]/15 text-[#70edbd]"><CheckCircle2 className="size-6" /></span><h1 className="mt-5 text-2xl font-black tracking-[-0.06em] text-white">Jesteś zalogowany.</h1><p className="mt-3 text-sm leading-6 text-[#aeb8d0]">Twoja przestrzeń DayForge zostanie pobrana po wejściu do aplikacji.</p><Link className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8066ff,#4e9cff)] px-5 text-sm font-semibold text-white" href="/today">Otwórz DayForge</Link></section></main>; }
