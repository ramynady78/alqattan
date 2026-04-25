import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import fs from "node:fs";

function readEnvFileValue(filePath: string, key: string): string | undefined {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    for (const lineRaw of raw.split(/\r?\n/)) {
      const line = lineRaw.trim();
      if (!line || line.startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx <= 0) continue;
      const k = line.slice(0, idx).trim();
      if (k !== key) continue;
      let value = line.slice(idx + 1).trim();
      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  } catch {
    // ignore
  }
  return undefined;
}

function resolveFrontendPort(): number {
  // Local-first:
  // - Use VITE_PORT for the Vite dev server when developing locally.
  // - Only fall back to PORT on Replit, where PORT is commonly injected.
  const rawPort =
    process.env.VITE_PORT ??
    (process.env.REPL_ID !== undefined ? process.env.PORT : undefined) ??
    "5173";

  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid port value: "${rawPort}"`);
  return port;
}

function resolveBackendProxyTarget(): string {
  // Highest priority override for non-local / container / deployed dev:
  const explicit = process.env.VITE_BACKEND_URL?.trim();
  if (explicit) return explicit;

  // Local dev default: follow backend/.env PORT to avoid mismatches like
  // backend on 3001 while proxy targets 3000.
  const backendEnvPath = path.resolve(import.meta.dirname, "..", "backend", ".env");
  const backendPortRaw = readEnvFileValue(backendEnvPath, "PORT")?.trim() || "3000";
  const backendPort = Number(backendPortRaw);
  if (Number.isFinite(backendPort) && backendPort > 0) {
    return `http://localhost:${backendPort}`;
  }

  return "http://localhost:3000";
}

const port = resolveFrontendPort();

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig(async ({ mode }) => {
  // In local dev, keep base "/" to avoid route duplication like "/admin/admin/login".
  // In production builds, honor BASE_PATH for sub-path hosting.
  const base = mode === "production" ? basePath : "/";

  const plugins = [react(), tailwindcss(), runtimeErrorOverlay()];

  if (process.env.REPL_ID !== undefined && mode !== "production") {
    plugins.push(
      await import("@replit/vite-plugin-cartographer").then((m) =>
        m.cartographer({
          root: path.resolve(import.meta.dirname, ".."),
        }),
      ),
    );
    plugins.push(await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()));
  }

  return {
    base,
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
      // In this repo, workspace packages are linked from `../shared/*`.
      // Preserve symlinks so module resolution uses the *frontend* node_modules
      // (otherwise Vite resolves to real paths under ../shared and then can't
      // find deps like @tanstack/react-query during production builds).
      preserveSymlinks: true,
      dedupe: ["react", "react-dom", "@tanstack/react-query"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": {
          target: resolveBackendProxyTarget(),
          changeOrigin: true,
        },
      },
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
