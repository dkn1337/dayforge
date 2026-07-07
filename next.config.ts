import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tauri bundles the static Next export from /out into the Windows application.
  output: "export",
};

export default nextConfig;
