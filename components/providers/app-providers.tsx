"use client";

import { Toaster } from "sonner";

import { AuthProvider } from "@/components/providers/auth-provider";
import { DayForgeStoreProvider } from "@/components/providers/dayforge-store-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DayForgeStoreProvider>
        {children}
        <Toaster
          closeButton
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: "!border-white/10 !bg-[#eef1ff] !text-[#12182a] !shadow-2xl",
              title: "!font-semibold",
              closeButton: "!border-[#18213c]/15 !bg-white !text-[#18213c]",
            },
          }}
        />
      </DayForgeStoreProvider>
    </AuthProvider>
  );
}
