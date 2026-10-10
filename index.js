/**
 * Entry point for hosts that expect /index.js (bot-hosting.net, etc.)
 * Runs slash deploy once, then starts the bot via tsx.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: __dirname,
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  try {
    // Register slash commands (safe to run on every start)
    await run("npx", ["tsx", "src/deploy-commands.ts"]);
  } catch (err) {
    console.error("[Aetherion] deploy-commands failed (bot will still start):", err.message);
  }

  // Start bot — this process replaces the current one
  const bot = spawn("npx", ["tsx", "src/index.ts"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  bot.on("exit", (code) => process.exit(code ?? 1));
  bot.on("error", (err) => {
    console.error("[Aetherion] failed to start:", err);
    process.exit(1);
  });
}

main();
