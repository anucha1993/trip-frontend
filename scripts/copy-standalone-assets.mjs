// Next.js "standalone" output doesn't automatically include the static assets
// (public/, .next/static) needed to actually serve the site. Copy them into
// the standalone bundle after every build so it stays a fully self-contained
// folder Plesk (or any plain Node host) can run with `node server.js`.
import { cpSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.warn("[copy-standalone-assets] .next/standalone not found — did the build run with output: 'standalone'?");
  process.exit(0);
}

cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), {
  recursive: true,
});

cpSync(
  path.join(root, ".next", "static"),
  path.join(standaloneDir, ".next", "static"),
  { recursive: true }
);

console.log("[copy-standalone-assets] copied public/ and .next/static into .next/standalone/");
