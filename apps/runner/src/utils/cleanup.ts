import fs from "fs/promises";

export async function cleanupDir(dir: string) {
  await fs.rm(dir, { recursive: true, force: true });
}
