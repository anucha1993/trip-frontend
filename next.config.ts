import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone/server.js — a self-contained Node server that
  // Plesk's Node.js (Passenger) hosting can run directly as the startup file.
  output: "standalone",
};

export default nextConfig;
