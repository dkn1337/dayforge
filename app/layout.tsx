import type { Metadata } from "next";

import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "DayForge — produktywność bez chaosu",
    template: "%s · DayForge",
  },
  description: "Premium workspace do planowania dnia, zadań, nawyków i głębokiej pracy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className="dark h-full bg-forge-bg">
      <body className="min-h-full bg-forge-bg antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
