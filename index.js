/**
 * Entry for hosts that run: node index.js
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const root = dirname(fileURLToPath(import.meta.url));
const tsxBin = join(root, "node_modules", "tsx", "dist", "cli.mjs");
const tsxCmd = existsSync(tsxBin) ? tsxBin : "tsx";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
    child.on("error", reject);
  });
}

async function main() {
  const runner = existsSync(tsxBin) ? process.execPath : "npx";
  const prefix = existsSync(tsxBin) ? [tsxBin] : ["tsx"];

  try {
    if (existsSync(tsxBin)) {
      await run(process.execPath, [tsxBin, "src/deploy-commands.ts"]);
    } else {
      await run("npx", ["tsx", "src/deploy-commands.ts"]);
    }
  } catch (e) {
    console.error("[Aetherion] deploy skipped:", e.message);
  }

  if (existsSync(tsxBin)) {
    const bot = spawn(process.execPath, [tsxBin, "src/index.ts"], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    bot.on("exit", (c) => process.exit(c ?? 1));
  } else {
    const bot = spawn("npx", ["tsx", "src/index.ts"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    bot.on("exit", (c) => process.exit(c ?? 1));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
