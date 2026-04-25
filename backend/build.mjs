import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";
import * as esbuild from "esbuild";
import pinoPlugin from "esbuild-plugin-pino";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  const entries = [
    path.resolve(artifactDir, "src/index.ts"),
    path.resolve(artifactDir, "src/seed.ts"),
    path.resolve(artifactDir, "src/migrate.ts"),
  ];
  const banner = `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);`;

  const external = [
    "*.node",
    // Shared packages live outside `backend/`, so keep their runtime deps resolvable from `backend/node_modules`.
    "drizzle-orm",
    "drizzle-orm/*",
    // Session store reads its own `table.sql` at runtime; bundling breaks `__dirname` resolution.
    "connect-pg-simple",
    "pg",
    "zod",
    // Avoid bundling pino (uses worker threads / dynamic loading).
    "pino",
    "pino-http",
    "pino-pretty",
    "thread-stream",
    "sonic-boom",
    "atomic-sleep",
    "sharp",
    "better-sqlite3",
    "sqlite3",
    "canvas",
    "bcrypt",
    "argon2",
    "fsevents",
    "re2",
    "farmhash",
    "xxhash-addon",
    "bufferutil",
    "utf-8-validate",
    "ssh2",
    "cpu-features",
    "dtrace-provider",
    "isolated-vm",
    "lightningcss",
    "pg-native",
    "oracledb",
    "mongodb-client-encryption",
    "nodemailer",
    "handlebars",
    "knex",
    "typeorm",
    "protobufjs",
    "onnxruntime-node",
    "@tensorflow/*",
    "@prisma/client",
    "@mikro-orm/*",
    "@grpc/*",
    "@swc/*",
    "@aws-sdk/*",
    "@azure/*",
    "@opentelemetry/*",
    "@google-cloud/*",
    "@google/*",
    "googleapis",
    "firebase-admin",
    "@parcel/watcher",
    "@sentry/profiling-node",
    "@tree-sitter/*",
    "aws-sdk",
    "classic-level",
    "dd-trace",
    "ffi-napi",
    "grpc",
    "hiredis",
    "kerberos",
    "leveldown",
    "miniflare",
    "mysql2",
    "newrelic",
    "odbc",
    "piscina",
    "realm",
    "ref-napi",
    "rocksdb",
    "sass-embedded",
    "sequelize",
    "serialport",
    "snappy",
    "tinypool",
    "usb",
    "workerd",
    "wrangler",
    "zeromq",
    "zeromq-prebuilt",
    "playwright",
    "puppeteer",
    "puppeteer-core",
    "electron",
  ];

  await esbuild.build({
    entryPoints: entries,
    bundle: true,
    platform: "node",
    format: "esm",
    outdir: distDir,
    logLevel: "info",
    sourcemap: "linked",
    outExtension: { ".js": ".mjs" },
    banner: { js: banner },
    external: external,
    plugins: [pinoPlugin()],
  });
}

buildAll().catch((err) => {
  if (err.code === "EFTYPE" || err.errno === -4028) {
    console.error("ERROR: esbuild binary spawn failed");
    console.error("This may be due to antivirus, Windows Defender, or other system restrictions");
    console.error("Trying alternative method...\n");
    
    // Try to use the CLI directly
    import("child_process").then(({ execSync }) => {
      try {
        const esbuildCli = require.resolve("esbuild/bin/esbuild");
        execSync(`node "${esbuildCli}" --help`, { stdio: "inherit" });
        console.error("esbuild CLI is available, but programmatic build failed");
      } catch (innerErr) {
        console.error("Alternative method also failed");
      }
      process.exit(1);
    });
  } else {
    console.error(err);
    process.exit(1);
  }
});
