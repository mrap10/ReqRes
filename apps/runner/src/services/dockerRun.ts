import { exec } from "child_process";

export function runDocker(
  workspace: string,
  timeoutMs: number
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const cmd = `
            docker run --rm \
            --network none \
            --memory=256m --cpus=0.5 \
            -v ${workspace}:/app \
            node:20-alpine \
            sh -c "npm install && npm test -- --runInBand"
        `;

    exec(cmd, { timeout: timeoutMs }, (err: Error | null, stdout: string, stderr: string): void => {
      if (err) {
        return reject(stderr || err.message);
      }
      resolve({ stdout, stderr });
    });
  });
}
