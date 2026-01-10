import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import { JestJSON } from "../types.js";

export function runDocker(workspace: string, timeoutMs: number): Promise<JestJSON> {
  return new Promise((resolve, reject) => {
    // Escape workspace path for shell (handle spaces and special chars)
    const escapedWorkspace = workspace.replace(/\\/g, "/").replace(/"/g, '\\"');
    const resultsFileName = "jest-results.json";
    const resultsPath = path.join(workspace, resultsFileName);

    const cmd = `
            docker run --rm \
            --network none \
            --memory=256m --cpus=0.5 \
            --read-only \
            --tmpfs /tmp:rw,noexec,nosuid,size=64m \
            -v "${escapedWorkspace}":/app:ro \
            -v "${escapedWorkspace}/node_modules":/app/node_modules:rw \
            -v "${escapedWorkspace}/${resultsFileName}":/app/${resultsFileName}:rw \
            -w /app \
            node:20-alpine \
            sh -c "cp -r /app /tmp/workspace && cd /tmp/workspace && npm install --ignore-scripts && (npm test -- --runInBand --json --outputFile=/app/${resultsFileName} --setupFilesAfterEnv='./tests/setup.ts' 2>/dev/null || npm test -- --runInBand --json --outputFile=/app/${resultsFileName})"
        `;

    exec(cmd, { timeout: timeoutMs }, (err: Error | null, _stdout: string, stderr: string) => {
      fs.readFile(resultsPath, "utf-8")
        .then((jestRaw) => {
          const jestResults = JSON.parse(jestRaw) as JestJSON;
          resolve(jestResults);
        })
        .catch((readError) => {
          const errorMessage = err ? stderr || err.message : String(readError);
          reject(new Error(`Test execution failed: ${errorMessage}`));
        });
    });
  });
}
