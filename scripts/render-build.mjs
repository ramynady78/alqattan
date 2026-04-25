import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { cp, mkdir, rm, stat } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..");
const npmExecPath = process.env["npm_execpath"];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    ...options,
  });

  if (result.error) throw result.error;
  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${command} ${args.join(" ")}`);
  }
}

function runNpm(args) {
  if (npmExecPath) {
    run(process.execPath, [npmExecPath, ...args], { env: process.env });
    return;
  }

  // Fallback for non-npm invocations (e.g. direct `node scripts/render-build.mjs`).
  // On Windows this may require `shell: true`, but Render (Linux) will still work.
  run("npm", args, { env: process.env, shell: process.platform === "win32" });
}

async function ensureDirExists(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  runNpm(["run", "build:frontend"]);

  const frontendOut = path.resolve(repoRoot, "frontend", "dist", "public");
  const backendClientOut = path.resolve(repoRoot, "backend", "public", "app");

  if (!(await pathExists(frontendOut))) {
    throw new Error(`Frontend build output not found at: ${frontendOut}`);
  }

  await rm(backendClientOut, { recursive: true, force: true });
  await ensureDirExists(backendClientOut);
  await cp(frontendOut, backendClientOut, { recursive: true });

  runNpm(["run", "build:backend"]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
