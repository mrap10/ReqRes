import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { JestJSON } from "../types.js";

export async function runDocker(
  workspace: string,
  timeoutMs: number,
  mode: "run" | "submit" = "submit"
): Promise<JestJSON> {
  const resultsFileName = "jest-results.json";
  const resultsPath = path.join(workspace, resultsFileName);

  await fs.writeFile(
    resultsPath,
    JSON.stringify({
      success: false,
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      testResults: [],
    })
  );

  return new Promise((resolve, reject) => {
    const dockerArgs = [
      "run",
      "--rm",
      "--memory=512m",
      "--cpus=1.5",
      "--read-only",
      "--network=none",
      "--tmpfs",
      "/tmp:rw,exec,size=512m",
      "--tmpfs",
      "/root:rw,size=64m",
      "-v",
      `${workspace}:/app:ro`,
      "-v",
      `${resultsPath}:/app/${resultsFileName}:rw`,
      "-w",
      "/app",
      "reqres-runner:latest",
      "sh",
      "-c",
      `
set -ux

export HOME=/tmp
export NODE_PATH=/runner/node_modules

cp -r /app /tmp/workspace
cd /tmp/workspace

/runner/node_modules/.bin/jest --runInBand --forceExit --json --outputFile=/app/${resultsFileName}${mode === "run" ? " --bail" : ""} || true
      `,
    ];

    const child = spawn("docker", dockerArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const killTimer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Docker execution timed out"));
    }, timeoutMs);

    child.stdout.on("data", () => {});
    child.stderr.on("data", () => {});

    child.on("error", (err) => {
      clearTimeout(killTimer);
      reject(err);
    });

    child.on("close", () => {
      clearTimeout(killTimer);

      fs.readFile(resultsPath, "utf-8")
        .then((raw) => {
          const parsed = JSON.parse(raw) as JestJSON;
          resolve(parsed);
        })
        .catch((err) => {
          reject(new Error(`Failed to read Jest results: ${String(err)}`));
        });
    });
  });
}
