import { exec } from "child_process";

export function runDocker(
  workspace: string,
  timeoutMs: number
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    // Escape workspace path for shell (handle spaces and special chars)
    const escapedWorkspace = workspace.replace(/\\/g, "/").replace(/"/g, '\\"');

    const cmd = `
            docker run --rm \
            --network none \
            --memory=256m --cpus=0.5 \
            --read-only \
            --tmpfs /tmp:rw,noexec,nosuid,size=64m \
            -v "${escapedWorkspace}":/app:ro \
            -v "${escapedWorkspace}/node_modules":/app/node_modules:rw \
            -w /app \
            node:20-alpine \
            sh -c "cp -r /app /tmp/workspace && cd /tmp/workspace && npm install --ignore-scripts && npm test -- --runInBand --setupFilesAfterEnv='./tests/setup.ts' 2>/dev/null || npm test -- --runInBand"
        `;

    exec(cmd, { timeout: timeoutMs }, (err: Error | null, stdout: string, stderr: string): void => {
      if (err) {
        return reject(stderr || err.message);
      }
      resolve({ stdout, stderr });
    });
  });
}
