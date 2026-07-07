"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { supabaseConfig } from "@/lib/supabase/config";
import { getSupabaseClient } from "@/lib/supabase/client";

type SyncStatus = "local" | "connecting" | "syncing" | "synced" | "error";

type AuthResult = { error: string | null; needsEmailConfirmation?: boolean };

type AuthContextValue = {
  isCloudConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  displayName: string;
  initials: string;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  setSyncStatus: (status: SyncStatus, message?: string | null) => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (displayName: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updateDisplayName: (displayName: string) => Promise<AuthResult>;
};

const LOCAL_PROFILE_KEY = "dayforge.local-profile.v1";
const DEFAULT_LOCAL_NAME = "Karol";

const AuthContext = createContext<AuthContextValue | null>(null);

function readLocalName(): string {
  if (typeof window === "undefined") return DEFAULT_LOCAL_NAME;
  try {
    const value = window.localStorage.getItem(LOCAL_PROFILE_KEY)?.trim();
    return value || DEFAULT_LOCAL_NAME;
  } catch {
    return DEFAULT_LOCAL_NAME;
  }
}

function toInitials(name: string): string {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return initials || "D";
}

function displayNameFromUser(user: User | null, fallback: string): string {
  if (!user) return fallback;
  const fromMetadata = typeof user.user_metadata.display_name === "string" ? user.user_metadata.display_name.trim() : "";
  return fromMetadata || user.email?.split("@")[0] || fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => supabaseConfig.configured);
  const [localName, setLocalName] = useState(readLocalName);
  const [syncStatus, setSyncStatusState] = useState<SyncStatus>(supabaseConfig.configured ? "connecting" : "local");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const setSyncStatus = useCallback((status: SyncStatus, message: string | null = null) => {
    setSyncStatusState(status);
    setSyncMessage(message);
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    let mounted = true;
    void client.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoading(false);
      setSyncStatus(error ? "error" : data.session ? "syncing" : "connecting", error?.message ?? null);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSyncStatus(nextSession ? "syncing" : "connecting");
      setSyncMessage(null);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setSyncStatus]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = getSupabaseClient();
    if (!client) return { error: "Supabase nie jest jeszcze skonfigurowany." };
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<AuthResult> => {
    const client = getSupabaseClient();
    if (!client) return { error: "Supabase nie jest jeszcze skonfigurowany." };
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    return { error: error?.message ?? null, needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    setSession(null);
    setSyncStatus("connecting");
  }, [setSyncStatus]);

  const sendPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    const client = getSupabaseClient();
    if (!client) return { error: "Supabase nie jest jeszcze skonfigurowany." };
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    return { error: error?.message ?? null };
  }, []);

  const updateDisplayName = useCallback(async (displayName: string): Promise<AuthResult> => {
    const safeName = displayName.trim();
    if (safeName.length < 2) return { error: "Podaj nazwę z co najmniej 2 znaków." };

    const client = getSupabaseClient();
    if (!client || !session?.user) {
      try { window.localStorage.setItem(LOCAL_PROFILE_KEY, safeName); } catch { /* local storage can be unavailable */ }
      setLocalName(safeName);
      return { error: null };
    }

    const [authResult, profileResult] = await Promise.all([
      client.auth.updateUser({ data: { display_name: safeName } }),
      client.from("profiles").update({ display_name: safeName, updated_at: new Date().toISOString() }).eq("id", session.user.id),
    ]);
    const error = authResult.error ?? profileResult.error;
    return { error: error?.message ?? null };
  }, [session]);

  const value = useMemo<AuthContextValue>(() => {
    const displayName = displayNameFromUser(session?.user ?? null, localName);
    return {
      isCloudConfigured: supabaseConfig.configured,
      isLoading,
      session,
      user: session?.user ?? null,
      displayName,
      initials: toInitials(displayName),
      syncStatus,
      syncMessage,
      setSyncStatus,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updateDisplayName,
    };
  }, [isLoading, localName, session, setSyncStatus, signIn, signOut, signUp, sendPasswordReset, syncMessage, syncStatus, updateDisplayName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
