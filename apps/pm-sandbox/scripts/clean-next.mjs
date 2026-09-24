import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");

if (!existsSync(nextDir)) {
  console.log("[clean-next] .next not present, nothing to clean.");
  process.exit(0);
}

for (let attempt = 1; attempt <= 3; attempt += 1) {
  try {
    rmSync(nextDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
    console.log("[clean-next] Removed .next successfully.");
    process.exit(0);
  } catch (error) {
    if (attempt === 3) {
      console.error("[clean-next] Failed to remove .next after retries:", error);
      process.exit(1);
    }
  }
}
