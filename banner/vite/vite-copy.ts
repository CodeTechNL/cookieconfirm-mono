import { type Plugin, type ViteDevServer } from "vite";
import path from "node:path";
import fs from "node:fs/promises";

async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else {
      await fs.copyFile(from, to);
    }
  }
}

export function copyOnDev(options: {
  copies: Array<{ from: string; to: string }>;
}): Plugin {
  return {
    name: "copy-on-dev",
    apply: "serve",

    configureServer(server: ViteDevServer) {
      server.httpServer?.once("listening", async () => {
        for (const job of options.copies) {
          const fromAbs = path.resolve(job.from);
          const toAbs = path.resolve(job.to);

          await copyDir(fromAbs, toAbs);
          console.log(`[vite] copied ${job.from} → ${job.to}`);
        }
      });
    },
  };
}
