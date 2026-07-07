const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const supabaseConfig = {
  url,
  anonKey,
  configured: Boolean(url && anonKey && /^https:\/\/.+\.supabase\.co$/i.test(url)),
};

export function getSupabaseSetupHint(): string {
  return "Dodaj NEXT_PUBLIC_SUPABASE_URL oraz NEXT_PUBLIC_SUPABASE_ANON_KEY do pliku .env.local, potem uruchom aplikację ponownie.";
}
