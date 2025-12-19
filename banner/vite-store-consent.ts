// vite.mock-api.ts
import type { Plugin, ViteDevServer } from "vite";

export function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",

    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/v1/store-consent", (req, res, next) => {
        if (req.method !== "POST") return next();

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");

          res.end(
            JSON.stringify({
              status: 'success'
            })
          );
        });
      });
    },
  };
}
