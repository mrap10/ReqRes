import fs from "fs/promises";
import path from "path";
import os from "os";

export async function createTempDir() {
  const id = crypto.randomUUID();
  const dir = path.join(os.tmpdir(), `reqres-${id}`);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}
