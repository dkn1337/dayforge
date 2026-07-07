"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

export function CloudAuthGate({ children }: { children: React.ReactNode }) {
  const { isCloudConfigured, isLoading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isCloudConfigured && !user && pathname !== "/auth") router.replace("/auth");
  }, [isCloudConfigured, isLoading, pathname, router, user]);

  if (isCloudConfigured && (isLoading || !user)) {
    return <div className="grid min-h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8066ff] border-t-transparent" aria-label="Ładowanie" /></div>;
  }

  return <>{children}</>;
}
